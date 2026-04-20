import { Controller, Get } from '@nestjs/common';
import { BannersService } from './banners.service';

/**
 * Public endpoint — no auth required.
 * Returns only active banners, sorted by sortOrder.
 * Used by the public-facing homepage carousel.
 */
@Controller('banners-public')
export class BannersPublicController {
  constructor(private readonly bannersService: BannersService) {}

  // GET /banners-public
  @Get()
  findActive() {
    return this.bannersService.findActive();
  }
}
