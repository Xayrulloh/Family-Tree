import { FamilyTreeMemberConnectionGetAllResponseSchema } from '@family-tree/shared';
import { Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
// biome-ignore lint/style/useImportType: <query/param doesn't work>
import {
  FamilyTreeMemberConnectionGetAllParamDto,
  FamilyTreeMemberConnectionGetAllResponseDto,
  FamilyTreeMemberConnectionGetByMemberParamDto,
} from './dto/family-tree-member-connection.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberConnectionService } from './family-tree-member-connection.service';

/**
 * Read-only connection routes shared by the owner/public/shared controllers.
 * Access is enforced by the per-prefix guard on the concrete controller.
 */
export abstract class BaseFamilyTreeMemberConnectionController {
  constructor(
    protected readonly familyTreeMemberConnectionService: FamilyTreeMemberConnectionService,
  ) {}

  // get all connections of tree
  @Get('connections')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberConnectionGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberConnectionGetAllResponseSchema)
  async getAllFamilyTreeMemberConnections(
    @Param() param: FamilyTreeMemberConnectionGetAllParamDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    return this.familyTreeMemberConnectionService.getAllFamilyTreeMemberConnections(
      param,
    );
  }

  // get connection of member in tree
  @Get(':memberUserId/connections')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberConnectionGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberConnectionGetAllResponseSchema)
  async getFamilyTreeMemberConnections(
    @Param() param: FamilyTreeMemberConnectionGetByMemberParamDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    return this.familyTreeMemberConnectionService.getFamilyTreeMemberConnections(
      param,
    );
  }
}
