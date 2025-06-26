'use client'

import * as React from 'react'
import useEmblaCarousel, { type EmblaOptionsType, type EmblaCarouselType } from 'embla-carousel-react'
import type { EmblaPluginType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type CarouselApi = EmblaCarouselType

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: EmblaOptionsType
  orientation?: 'horizontal' | 'vertical'
  plugins?: EmblaPluginType[]
  setApi?: (api: CarouselApi) => void
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    { className, orientation = 'horizontal', opts, setApi, plugins = [], children, ...props },
    ref,
  ) => {
    const plugin = React.useMemo(() => plugins, [plugins])
    const [emblaRef, emblaApi] = useEmblaCarousel(
      {
        axis: orientation === 'vertical' ? 'y' : 'x',
        ...opts,
      },
      plugin,
    )

    React.useEffect(() => {
      if (!setApi || !emblaApi) return
      setApi(emblaApi)
    }, [emblaApi, setApi])

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <div ref={emblaRef} className="overflow-hidden">
          <div className={cn('flex', orientation === 'vertical' && 'flex-col')}>{children}</div>
        </div>
      </div>
    )
  },
)
Carousel.displayName = 'Carousel'

export const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('-ml-4 flex', className)} {...props} />
  ),
)
CarouselContent.displayName = 'CarouselContent'

export const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pl-4 shrink-0 grow-0 basis-full', className)} {...props} />
  ),
)
CarouselItem.displayName = 'CarouselItem'

export const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="secondary"
      size="icon"
      className={cn('absolute left-2 top-1/2 -translate-y-1/2', className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  ),
)
CarouselPrevious.displayName = 'CarouselPrevious'

export const CarouselNext = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="secondary"
      size="icon"
      className={cn('absolute right-2 top-1/2 -translate-y-1/2', className)}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  ),
)
CarouselNext.displayName = 'CarouselNext'

export const CarouselAutoplay = Autoplay
