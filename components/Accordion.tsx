import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { ServiceItem } from '../types';

interface AccordionProps {
  items: ServiceItem[];
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>('fundacao');

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.id} className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggle(item.id)}
            className="w-full flex justify-between items-start text-left group"
          >
            <span className="text-lg md:text-xl text-primary font-bold group-hover:opacity-80 transition-opacity">
              {item.title} <span className="font-normal text-gray-900">{item.subtitle}</span>
            </span>
            <span className="text-primary ml-4 pt-1">
              {openId === item.id ? <Minus size={24} /> : <Plus size={24} />}
            </span>
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openId === item.id ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-gray-600 leading-relaxed max-w-3xl">
              {item.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};