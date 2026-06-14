import {
  FamilyTreeMemberGetAllResponseSchema,
  FamilyTreeMemberGetResponseSchema,
} from '@family-tree/shared';
import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
import { RequirePermission } from '~/common/decorators/require-permission.decorator';
// biome-ignore lint/style/useImportType: <query/param doesn't work>
import {
  FamilyTreeMemberCreateChildRequestDto,
  FamilyTreeMemberCreateParentsRequestDto,
  FamilyTreeMemberCreateSpouseRequestDto,
  FamilyTreeMemberGetAllParamDto,
  FamilyTreeMemberGetAllResponseDto,
  FamilyTreeMemberGetParamDto,
  FamilyTreeMemberGetResponseDto,
  FamilyTreeMemberUpdateRequestDto,
} from './dto/family-tree-member.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberService } from './family-tree-member.service';

/**
 * Read-only member routes. Mounted by the public controller (read-only) and
 * extended by the write tier for owner/shared. Access is enforced entirely by
 * the per-prefix guard on the concrete controller — these handlers are pure.
 */
export abstract class BaseFamilyTreeMemberReadController {
  constructor(
    protected readonly familyTreeMemberService: FamilyTreeMemberService,
  ) {}

  // get all nodes of tree
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberGetAllResponseSchema)
  async getAllFamilyTreeMembers(
    @Param() param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetAllResponseDto> {
    return this.familyTreeMemberService.getAllFamilyTreeMembers(param);
  }

  // get node by id and tree
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberGetResponseDto })
  @ZodSerializerDto(FamilyTreeMemberGetResponseSchema)
  async getFamilyTreeMember(
    @Param() param: FamilyTreeMemberGetParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    return this.familyTreeMemberService.getFamilyTreeMember(param);
  }
}

/**
 * Read + write member routes. Mounted by the owner and shared controllers.
 * Write routes carry `@RequirePermission(...)`, honored only by the shared
 * guard (the owner guard grants full access).
 */
export abstract class BaseFamilyTreeMemberWriteController extends BaseFamilyTreeMemberReadController {
  // add member create (child)
  @Post('child')
  @RequirePermission('canAddMembers')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: FamilyTreeMemberGetResponseDto })
  @ZodSerializerDto(FamilyTreeMemberGetResponseSchema)
  async createFamilyTreeMemberChild(
    @Body() body: FamilyTreeMemberCreateChildRequestDto,
    @Param() param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    return this.familyTreeMemberService.createFamilyTreeMemberChild(
      param.familyTreeId,
      body,
    );
  }

  // add member create (spouse)
  @Post('spouse')
  @RequirePermission('canAddMembers')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: FamilyTreeMemberGetResponseDto })
  @ZodSerializerDto(FamilyTreeMemberGetResponseSchema)
  async createFamilyTreeMemberSpouse(
    @Body() body: FamilyTreeMemberCreateSpouseRequestDto,
    @Param() param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    return this.familyTreeMemberService.createFamilyTreeMemberSpouse(
      param.familyTreeId,
      body,
    );
  }

  // add member create (parents)
  @Post('parents')
  @RequirePermission('canAddMembers')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: FamilyTreeMemberGetResponseDto })
  @ZodSerializerDto(FamilyTreeMemberGetResponseSchema)
  async createFamilyTreeMemberParents(
    @Body() body: FamilyTreeMemberCreateParentsRequestDto,
    @Param() param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    return this.familyTreeMemberService.createFamilyTreeMemberParents(
      param.familyTreeId,
      body,
    );
  }

  // edit member user
  @Put(':id')
  @RequirePermission('canEditMembers')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async updateFamilyTreeMember(
    @Param() param: FamilyTreeMemberGetParamDto,
    @Body() body: FamilyTreeMemberUpdateRequestDto,
  ): Promise<void> {
    return this.familyTreeMemberService.updateFamilyTreeMember(param, body);
  }

  // delete member user
  @Delete(':id')
  @RequirePermission('canDeleteMembers')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async deleteFamilyTreeMember(
    @Param() param: FamilyTreeMemberGetParamDto,
  ): Promise<void> {
    return this.familyTreeMemberService.deleteFamilyTreeMember(param);
  }
}
