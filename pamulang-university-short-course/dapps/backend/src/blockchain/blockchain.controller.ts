import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';

@ApiTags('simple-storage')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('value')
  @ApiOperation({ summary: 'Get latest stored value' })
  getLatestValue() {
    return this.blockchainService.getLatestValue();
  }

  @Get('events')
  @ApiOperation({ summary: 'Get ValueUpdated events' })
  @ApiQuery({ name: 'fromBlock', type: Number })
  @ApiQuery({ name: 'toBlock', type: Number })
  getEvents(
    @Query('fromBlock') fromBlock: number,
    @Query('toBlock') toBlock: number,
  ) {
    return this.blockchainService.getValueUpdatedEvents(fromBlock, toBlock);
  }
  
}