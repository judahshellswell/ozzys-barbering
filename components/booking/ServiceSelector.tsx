import { ServiceGrid } from '@/components/services/ServiceGrid';
import type { Service } from '@/types';

interface ServiceSelectorProps {
  services: Service[];
  selectedId?: string;
  onSelect: (service: Service) => void;
}

export function ServiceSelector({ services, selectedId, onSelect }: ServiceSelectorProps) {
  return (
    <div>
      <h2 className="font-display text-3xl tracking-wide mb-2">Choose a Service</h2>
      <p className="text-muted-foreground mb-6">Select what you'd like done today.</p>
      <ServiceGrid services={services} selectedId={selectedId} onSelect={onSelect} />
    </div>
  );
}
