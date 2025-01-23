export class Shop {
  constructor(stats, onComplete) {
    this.stats = stats;
    this.onComplete = onComplete;

    this.items = [
      { name: 'Energy Level Up', cost: 50, effect: () => { this.stats.energyLevel++; } },
      { name: 'Running Boost', cost: 100, effect: () => { this.stats.running++; } },
      { name: 'Swimming Boost', cost: 100, effect: () => { this.stats.swimming++; } },
      { name: 'Flying Boost', cost: 100, effect: () => { this.stats.flying++; } }
    ];

    this.clickSound = document.getElementById('clickSound');

    this.createShopUI();
  }

  createShopUI() {
    const shopDiv = document.createElement('div');
    shopDiv.style.position = 'absolute';
    shopDiv.style.top = '50%';
    shopDiv.style.left = '50%';
    shopDiv.style.transform = 'translate(-50%, -50%)';
    shopDiv.style.background = 'white';
    shopDiv.style.padding = '20px';
    shopDiv.style.borderRadius = '10px';

    this.items.forEach(item => {
      const button = document.createElement('button');
      button.textContent = `${item.name} (${item.cost} coins)`;
      button.addEventListener('click', () => {
        this.clickSound.currentTime = 0;
        this.clickSound.play();
        if (this.stats.coins >= item.cost) {
          this.stats.coins -= item.cost;
          item.effect();
          this.onComplete();
        } else {
          alert('Not enough coins!');
        }
      });
      shopDiv.appendChild(button);
      shopDiv.appendChild(document.createElement('br'));
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
      this.clickSound.currentTime = 0;
      this.clickSound.play();
      shopDiv.remove();
    });
    shopDiv.appendChild(closeButton);

    document.body.appendChild(shopDiv);
  }
}