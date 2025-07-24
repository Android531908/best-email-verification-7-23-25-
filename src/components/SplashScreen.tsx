import React from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    console.log('SplashScreen component mounted');
    const timer = setTimeout(() => {
      console.log('Splash timer complete');
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleImageLoad = () => {
    console.log('Splash image loaded successfully');
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.log('Splash image failed to load, showing fallback');
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 z-50">
      {/* Loading State */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-amber-800 font-medium">Loading Curio Tutors...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`w-full h-full transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {!imageError ? (
          <img
            src="/src/assets/AD9831C0-8E6B-45E1-9DC1-2DCD104E8CA8.png"
            alt="Curio Tutors - Interactive Learning Building"
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="eager"
            style={{
              imageRendering: 'auto',
              maxWidth: '100vw',
              maxHeight: '100vh'
            }}
          />
        ) : (
          /* Fallback Content */
          <div className="w-full h-full bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 flex items-center justify-center">
            <div className="text-center px-8">
              <div className="mb-8">
                <img 
                  src="/src/assets/Company Logo copy copy.jpeg"
                  alt="Curio Tutors Logo"
                  className="w-32 h-32 mx-auto object-contain rounded-2xl shadow-lg"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}
                />
              </div>
              <div className="text-6xl font-black text-amber-800 mb-2">Curio</div>
              <div className="text-6xl font-black text-green-800">Tutors</div>
              <div className="mt-6 text-xl text-amber-700 font-medium">
                Where Learning Comes to Life
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;