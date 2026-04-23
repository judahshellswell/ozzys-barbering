import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { businessConfig } from '@/config/business.config';
import { Clock } from 'lucide-react';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'selectable';
}

export function ServiceCard({ service, selected, onClick, variant = 'default' }: ServiceCardProps) {
  const { currency } = businessConfig.booking;

  return (
    <Card
      onClick={onClick}
      className={`transition-all duration-200 ${
        variant === 'selectable'
          ? 'cursor-pointer hover:shadow-md'
          : ''
      } ${
        selected
          ? 'border-[#6366f1] ring-2 ring-[#6366f1] shadow-md'
          : 'border-border hover:border-[#6366f1]/50'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl tracking-wide text-foreground">{service.name}</h3>
            {service.description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {service.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {service.duration} min
              </Badge>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-[#6366f1]">
              {typeof service.price === 'string'
                ? `${currency}${service.price.split('-').join(` – ${currency}`)}`
                : `${currency}${Number(service.price).toFixed(2)}`}
            </span>
          </div>
        </div>
        {selected && (
          <div className="mt-3 text-xs font-medium text-[#6366f1]">✓ Selected</div>
        )}
      </CardContent>
    </Card>
  );
}
