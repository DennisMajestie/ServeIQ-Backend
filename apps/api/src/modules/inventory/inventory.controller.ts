import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('inventory')
  @ApiOperation({ summary: 'List all inventory items with current stock levels' })
  @ApiResponse({ status: 200, description: 'List of inventory items.' })
  async findAll(@Request() req: any) {
    return this.inventoryService.findAll(req.user.branchId);
  }

  @Get('inventory/bestsellers')
  @ApiOperation({ summary: 'Best-selling inventory items with sales data and stock levels for restock prioritization' })
  @ApiQuery({ name: 'dateFrom', required: false, example: '2026-06-01' })
  @ApiQuery({ name: 'dateTo', required: false, example: '2026-06-28' })
  @ApiResponse({ status: 200, description: 'Bestsellers, slow movers, and out-of-stock items.' })
  async getBestsellers(
    @Request() req: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.inventoryService.getBestsellers(req.user.branchId, dateFrom, dateTo);
  }

  @Get('inventory/alerts')
  @ApiOperation({ summary: 'Get items below reorder level' })
  @ApiResponse({ status: 200, description: 'Low stock alerts.' })
  async getAlerts(@Request() req: any) {
    return this.inventoryService.getAlerts(req.user.branchId);
  }

  @Get('inventory/:id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory item UUID' })
  @ApiResponse({ status: 200, description: 'Inventory item details.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.findOne(id, req.user.branchId);
  }

  @Get('inventory/:id/movements')
  @ApiOperation({ summary: 'Get stock movement history for an inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item UUID' })
  @ApiResponse({ status: 200, description: 'Stock movements list.' })
  async getMovements(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.getMovements(id, req.user.branchId);
  }

  @Post('inventory')
  @ApiOperation({ summary: 'Create a new inventory item linked to a menu item' })
  @ApiResponse({ status: 201, description: 'Inventory item created.' })
  async create(@Request() req: any, @Body() body: { menu_item_id: string; quantity_in_stock?: number; reorder_level?: number }) {
    return this.inventoryService.create(req.user.branchId, body);
  }

  @Patch('inventory/:id')
  @ApiOperation({ summary: 'Update inventory item (reorder level)' })
  @ApiParam({ name: 'id', description: 'Inventory item UUID' })
  @ApiResponse({ status: 200, description: 'Inventory item updated.' })
  async update(@Param('id') id: string, @Request() req: any, @Body() body: { reorder_level?: number }) {
    return this.inventoryService.update(id, req.user.branchId, body);
  }

  @Post('inventory/:id/stock')
  @ApiOperation({ summary: 'Add stock to an inventory item (purchase or adjustment)' })
  @ApiParam({ name: 'id', description: 'Inventory item UUID' })
  @ApiResponse({ status: 200, description: 'Stock added.' })
  async addStock(@Param('id') id: string, @Request() req: any, @Body() body: { quantity: number; notes?: string }) {
    return this.inventoryService.addStock(id, req.user.branchId, body);
  }

  @Delete('inventory/:id')
  @ApiOperation({ summary: 'Delete an inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item UUID' })
  @ApiResponse({ status: 200, description: 'Inventory item deleted.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.remove(id, req.user.branchId);
  }

  @Get('reports/stock-variance')
  @ApiOperation({ summary: 'Stock variance report — expected vs actual stock levels' })
  @ApiResponse({ status: 200, description: 'Stock variance report.' })
  async getStockVariance(@Request() req: any) {
    return this.inventoryService.getStockVariance(req.user.branchId);
  }
}
