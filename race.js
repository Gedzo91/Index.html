export class RaceGame {
  constructor(canvas, ctx, duck, stats, onComplete) {
    const raceScreen = document.createElement('div');
    raceScreen.className = 'locked-screen';
    raceScreen.innerHTML = `
      <div class="race-content">
        <h2>Race Selection</h2>
        
        <div class="race-track">
          <div class="race-opponent">
            <div class="opponent-duck orange"></div>
            <div class="opponent-speech">
              <p>"You will probably be trash at this race! Hah!"</p>
              <p class="locked-text">🔒 Race coming soon! Train harder! 🔒</p>
            </div>
          </div>

          <div class="coming-soon-races">
            <div class="race-placeholder">
              <div class="question-mark">?</div>
              <p>More races coming soon!</p>
            </div>
            <div class="race-placeholder">
              <div class="question-mark">?</div>
              <p>More races coming soon!</p>
            </div>
          </div>
        </div>

        <button class="close-button">Back to Training 🦆</button>
      </div>
    `;
    
    document.body.appendChild(raceScreen);

    const closeButton = raceScreen.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      if (raceScreen && raceScreen.parentNode) {
        raceScreen.remove();
      }
      onComplete(0);
    });
  }
}