const HowToPlayTab = () => (
        <div className="how-to-play-content">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
            How to play
          </h2>

          <p className="text-white mb-4 sm:mb-6 text-sm sm:text-base">
            You have 8 attempts to guess the mystery LOL player. Every day there
            will be a new player to guess for each league!
          </p>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-white uppercase mb-2 sm:mb-4">
              Results
            </h3>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 mr-3 sm:mr-4"></div>
                <p className="text-white text-sm sm:text-base">Correct match</p>
              </div>

              <div className="flex items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 mr-3 sm:mr-4"></div>
                <p className="text-white text-sm sm:text-base">
                  Partial match (same team, role, nationality or league)
                </p>
              </div>

              <div className="flex items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 mr-3 sm:mr-4"></div>
                <p className="text-white text-sm sm:text-base">
                  Incorrect match
                </p>
              </div>
            </div>
          </div>
        </div>
);

export default HowToPlayTab;
