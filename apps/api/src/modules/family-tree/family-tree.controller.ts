import {
  FamilyTreeArrayResponseSchema,
  FamilyTreeMemberConnectionEnum,
  FamilyTreeResponseSchema,
  UserGenderEnum,
} from '@family-tree/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
import { JWTAuthGuard } from '~/common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '~/shared/types/request-with-user';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberService } from '../family-tree-member/family-tree-member.service';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberConnectionService } from '../family-tree-member-connection/family-tree-member-connection.service';
import {
  FamilyTreeArrayResponseDto,
  FamilyTreeCreateRequestDto,
  type FamilyTreeIdParamDto,
  type FamilyTreeNameParamDto,
  FamilyTreeResponseDto,
  FamilyTreeUpdateRequestDto,
} from './dto/family-tree.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeService } from './family-tree.service';

@ApiTags('Family Tree')
@Controller('family-trees')
export class FamilyTreeController {
  constructor(
    private readonly familyTreeService: FamilyTreeService,
    private readonly familyTreeMemberService: FamilyTreeMemberService,
    private readonly familyTreeMemberConnectionService: FamilyTreeMemberConnectionService,
  ) {}

  // Find family trees of user
  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeArrayResponseDto })
  @ZodSerializerDto(FamilyTreeArrayResponseSchema)
  async getFamilyTreesOfUser(
    @Req() req: AuthenticatedRequest,
  ): Promise<FamilyTreeArrayResponseDto> {
    return this.familyTreeService.getFamilyTreesOfUser(req.user.id);
  }

  // Find family trees by name (only public [public = true]) only 10 of them (name length must be at least 3)
  @Get('publics/:name')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'name', required: true, type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeArrayResponseDto })
  @ZodSerializerDto(FamilyTreeArrayResponseSchema)
  async getFamilyTreesByName(
    @Param() param: FamilyTreeNameParamDto,
  ): Promise<FamilyTreeArrayResponseDto> {
    return this.familyTreeService.getFamilyTreesByName(param.name);
  }

  // Find family tree by id
  @Get(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeResponseDto })
  @ZodSerializerDto(FamilyTreeResponseSchema)
  async getFamilyTreeById(
    @Param() param: FamilyTreeIdParamDto,
  ): Promise<FamilyTreeResponseDto> {
    return this.familyTreeService.getFamilyTreeById(param.id);
  }

  // Create family tree for user
  @Post()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiBody({ type: FamilyTreeCreateRequestDto })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: FamilyTreeResponseDto })
  @ZodSerializerDto(FamilyTreeResponseSchema)
  async createFamilyTree(
    @Req() req: AuthenticatedRequest,
    @Body() body: FamilyTreeCreateRequestDto,
  ): Promise<FamilyTreeResponseDto> {
    const familyTree = await this.familyTreeService.createFamilyTree(
      req.user.id,
      body,
    );
    // creating single member (defining gender by user gender male | female) or parents if unknown
    // creating member of that family (asynchronously but not waiting for it)
    // 1. create member if => male or female
    if (req.user.gender !== UserGenderEnum.UNKNOWN) {
      this.familyTreeMemberService.createFamilyTreeMember(
        req.user.id,
        familyTree.id,
        {
          name: req.user.name,
          gender: req.user.gender,
          image: req.user.image,
          description: req.user.description,
          dob: req.user.dob,
          dod: req.user.dod,
        },
      );
    } else {
      // 2. create parents if => unknown
      const husband = await this.familyTreeMemberService.createFamilyTreeMember(
        req.user.id,
        familyTree.id,
        {
          name: 'John Doe',
          gender: UserGenderEnum.MALE,
          image: `https://api.dicebear.com/7.x/notionists/svg?seed=${familyTree.id}`,
          description: 'Husband',
          dob: '1990-01-01',
          dod: null,
        },
      );
      const wife = await this.familyTreeMemberService.createFamilyTreeMember(
        req.user.id,
        familyTree.id,
        {
          name: 'Jane Doe',
          gender: UserGenderEnum.FEMALE,
          image: `https://api.dicebear.com/7.x/notionists/svg?seed=${husband}`,
          description: 'Wife',
          dob: '1990-01-01',
          dod: null,
        },
      );

      // 3. connect parents to each other
      this.familyTreeMemberConnectionService.createFamilyTreeMemberConnection(
        req.user.id,
        { familyTreeId: familyTree.id },
        {
          fromMemberId: husband.id,
          toMemberId: wife.id,
          type: FamilyTreeMemberConnectionEnum.SPOUSE,
        },
      );
    }

    return familyTree;
  }

  // Update family tree by id
  @Put(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiBody({ type: FamilyTreeUpdateRequestDto })
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async updateFamilyTree(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeIdParamDto,
    @Body() body: FamilyTreeUpdateRequestDto,
  ): Promise<void> {
    return this.familyTreeService.updateFamilyTree(req.user.id, param.id, body);
  }

  // Delete family tree by id
  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async deleteFamilyTree(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeIdParamDto,
  ): Promise<void> {
    return this.familyTreeService.deleteFamilyTree(req.user.id, param.id);
  }
}
