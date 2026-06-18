import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { TableService } from './table.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';

@ApiTags('Tables')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tables for the branch' })
  @ApiResponse({ status: 200, description: 'List of tables with statuses.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Request() req: any) {
    return this.tableService.findAllByBranch(req.user.branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a table by ID' })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiResponse({ status: 200, description: 'Table details.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.tableService.findOne(id, req.user.branchId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new table' })
  @ApiResponse({ status: 201, description: 'Table created.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Request() req: any, @Body() createDto: CreateTableDto) {
    return this.tableService.create({
      ...createDto,
      branch_id: req.user.branchId,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a table' })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiResponse({ status: 200, description: 'Table updated.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateDto: UpdateTableDto,
  ) {
    return this.tableService.update(id, req.user.branchId, updateDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update table status (available/occupied/reserved)' })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiResponse({ status: 200, description: 'Table status updated.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() statusDto: UpdateTableStatusDto,
  ) {
    return this.tableService.updateStatus(id, req.user.branchId, statusDto.status);
  }
}
