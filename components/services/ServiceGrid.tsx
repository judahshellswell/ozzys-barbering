import { ServiceCard } from './ServiceCard';
import type { Service } from '@/types';

interface ServiceGridProps {
  services: Service[];
  selectedId?: string;
  onSelect?: (service: Service) => void;
}

export function ServiceGrid({ services, selectedId, onSelect }: ServiceGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          selected={selectedId === service.id}
          onClick={onSelect ? () => onSelect(service) : undefined}
          variant={onSelect ? 'selectable' : 'default'}
        />
      ))}
    </div>
  );
}
