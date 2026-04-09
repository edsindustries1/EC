import React from 'react';
import { FiClock, FiCheck, FiTruck, FiPlayCircle, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    requested: {
      label: 'Pending Quote',
      icon: FiClock,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
    },
    quoted: {
      label: 'Quote Received',
      icon: FiCheck,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
    },
    confirmed: {
      label: 'Confirmed',
      icon: FiCheck,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
    },
    assigned: {
      label: 'Driver Assigned',
      icon: FiTruck,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300',
    },
    in_progress: {
      label: 'In Progress',
      icon: FiPlayCircle,
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-800',
      borderColor: 'border-indigo-300',
    },
    completed: {
      label: 'Completed',
      icon: FiCheckCircle,
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-300',
    },
    cancelled: {
      label: 'Cancelled',
      icon: FiAlertCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
    },
    pending: {
      label: 'Pending Quote',
      icon: FiClock,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
    },
  };

  const config = statusConfig[status] || statusConfig.requested;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <Icon size={16} />
      <span>{config.label}</span>
    </div>
  );
};

export default StatusBadge;
