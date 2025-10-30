'use client';

interface MajorIncident {
  name: string;
  commentCount: number;
}

interface MajorIncidentsProps {
  incidents: MajorIncident[];
}

export default function MajorIncidents({ incidents }: MajorIncidentsProps) {
  if (incidents.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-2">
        주요 사건이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {incidents.map((incident, index) => (
        <div 
          key={index}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm text-gray-700 font-medium truncate">
              {incident.name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 ml-2">
            <svg 
              className="w-3 h-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
            <span>{incident.commentCount.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}