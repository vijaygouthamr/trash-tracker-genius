const PhoneMockup = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-muted/30 to-accent/20 p-4">
      <div className="relative">
        {/* Phone case */}
        <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
          {/* Phone screen */}
          <div className="bg-background rounded-[2.5rem] overflow-hidden shadow-inner relative" style={{ width: '375px', height: '812px' }}>
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded-b-3xl h-7 w-48 z-50" />
            
            {/* Screen content */}
            <div className="relative h-full overflow-y-auto">
              {children}
            </div>
          </div>
          
          {/* Side buttons */}
          <div className="absolute -left-1 top-28 w-1 h-12 bg-gray-700 rounded-l" />
          <div className="absolute -left-1 top-44 w-1 h-16 bg-gray-700 rounded-l" />
          <div className="absolute -right-1 top-44 w-1 h-20 bg-gray-700 rounded-r" />
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
