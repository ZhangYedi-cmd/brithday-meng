// -----------------------------------------------------
// Canvas Engine for Star Bottle Game
// -----------------------------------------------------

interface Point { x: number; y: number; }

export class StarEntity {
    id: number;
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    radius: number;
    isLucky: boolean;
    phase: number;
    
    // Movement
    driftSeed: number;
    
    // State
    state: 'floating' | 'flying' | 'collected';
    flyProgress: number; // 0 to 1
    flyStart: Point;
    flyControl: Point;
    flyEnd: Point;

    constructor(w: number, h: number, isLucky: boolean = false) {
        this.id = Math.random();
        this.x = Math.random() * w;
        this.y = Math.random() * (h * 0.6); // Top 60% only
        this.baseX = this.x;
        this.baseY = this.y;
        this.isLucky = isLucky;
        this.radius = isLucky ? 4 + Math.random() * 3 : 2 + Math.random() * 2;
        this.phase = Math.random() * Math.PI * 2;
        this.driftSeed = 0.5 + Math.random() * 0.5;
        
        this.state = 'floating';
        this.flyProgress = 0;
        this.flyStart = { x: 0, y: 0 };
        this.flyControl = { x: 0, y: 0 };
        this.flyEnd = { x: 0, y: 0 };
    }

    startFlying(target: Point) {
        this.state = 'flying';
        this.flyStart = { x: this.x, y: this.y };
        this.flyEnd = target;
        // Bezier Control Point: Random offset to create arc
        this.flyControl = {
            x: (this.x + target.x) / 2 + (Math.random() - 0.5) * 100,
            y: Math.min(this.x, target.y) - 100 
        };
    }
}

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 1; // Slight float up
        this.life = 1.0;
        this.maxLife = 0.5 + Math.random() * 0.5;
        this.color = color;
        this.size = Math.random() * 3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

export class CanvasScene {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    
    stars: StarEntity[] = [];
    particles: Particle[] = [];
    
    bottlePos: Point = { x: 0, y: 0 };
    
    // Callbacks
    onCollect: (star: StarEntity) => void;
    
    // Animation Loop
    animationId: number = 0;
    time: number = 0;

    constructor(canvas: HTMLCanvasElement, onCollect: (s: StarEntity) => void) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.width = canvas.width;
        this.height = canvas.height;
        this.onCollect = onCollect;
        
        this.resize();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight * 0.65; // Occupy 65% of screen
        this.canvas.width = this.width * 2; // Retina
        this.canvas.height = this.height * 2;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(2, 2);
        
        this.bottlePos = { x: this.width / 2, y: this.height - 40 };
    }

    initStars(count: number) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push(new StarEntity(this.width, this.height));
        }
    }

    // Skill: Shake/Wind
    triggerShake() {
        this.stars.forEach(star => {
            if (star.state === 'floating') {
                star.baseX += (Math.random() - 0.5) * 100;
                star.baseY += (Math.random() - 0.5) * 50;
                // Clamp
                star.baseX = Math.max(20, Math.min(this.width - 20, star.baseX));
                star.baseY = Math.max(20, Math.min(this.height - 100, star.baseY));
                
                // Spawn some luck
                if (Math.random() > 0.7) {
                    star.isLucky = true;
                    star.radius = 6;
                }
            }
        });
        this.spawnExplosion(this.width/2, this.height/2, 20, '#fbbf24');
    }

    // Magnet: Pull stars to a point
    magnetPull(targetX: number, targetY: number) {
        this.stars.forEach(star => {
            if (star.state === 'floating') {
                const dx = targetX - star.x;
                const dy = targetY - star.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 150) {
                    star.x += dx * 0.05;
                    star.y += dy * 0.05;
                }
            }
        });
    }

    collectStars(starIds: number[]) {
        starIds.forEach(id => {
            const star = this.stars.find(s => s.id === id);
            if (star && star.state === 'floating') {
                star.startFlying(this.bottlePos);
                this.spawnExplosion(star.x, star.y, 8, star.isLucky ? '#fbbf24' : '#fff');
            }
        });
    }

    spawnExplosion(x: number, y: number, count: number, color: string) {
        for(let i=0; i<count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    handleClick(x: number, y: number): boolean {
        // Find clicked star (reverse iterate for z-index)
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const s = this.stars[i];
            if (s.state !== 'floating') continue;

            const dx = x - s.x;
            const dy = y - s.y;
            // Hitbox slightly larger than visual
            if (Math.sqrt(dx*dx + dy*dy) < 30) {
                this.collectStars([s.id]);
                return true;
            }
        }
        return false;
    }

    getClosestStars(x: number, y: number, count: number): number[] {
        const candidates = this.stars
            .filter(s => s.state === 'floating')
            .map(s => ({
                id: s.id,
                dist: Math.sqrt(Math.pow(x - s.x, 2) + Math.pow(y - s.y, 2))
            }))
            .sort((a, b) => a.dist - b.dist);
            
        return candidates.slice(0, count).map(c => c.id);
    }

    start() {
        const loop = () => {
            this.update();
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    stop() {
        cancelAnimationFrame(this.animationId);
    }

    update() {
        this.time += 0.01;

        // Update Stars
        this.stars.forEach(star => {
            if (star.state === 'floating') {
                // Gentle drift
                const offsetX = Math.sin(this.time * star.driftSeed + star.phase) * 10;
                const offsetY = Math.cos(this.time * star.driftSeed * 0.5 + star.phase) * 5;
                
                // Lerp back to base if not being pulled by magnet
                star.x += (star.baseX + offsetX - star.x) * 0.05;
                star.y += (star.baseY + offsetY - star.y) * 0.05;

            } else if (star.state === 'flying') {
                star.flyProgress += 0.02; // Fly speed
                
                // Quadratic Bezier
                const t = star.flyProgress;
                const invT = 1 - t;
                
                star.x = invT * invT * star.flyStart.x + 
                         2 * invT * t * star.flyControl.x + 
                         t * t * star.flyEnd.x;
                         
                star.y = invT * invT * star.flyStart.y + 
                         2 * invT * t * star.flyControl.y + 
                         t * t * star.flyEnd.y;
                         
                // Shrink while flying
                if (t >= 1) {
                    star.state = 'collected';
                    this.onCollect(star);
                    this.spawnExplosion(this.bottlePos.x, this.bottlePos.y - 20, 5, '#fcd34d');
                }
            }
        });

        // Remove collected stars cleanly if needed, or just keep them hidden
        // Here we keep them in array but don't draw if collected to avoid index shifting issues during loop
        
        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Stars
        this.stars.forEach(star => {
            if (star.state === 'collected') return;

            const opacity = 0.5 + Math.sin(this.time * 3 + star.phase) * 0.5;
            const scale = star.state === 'flying' ? (1 - star.flyProgress) : 1;

            this.ctx.beginPath();
            this.ctx.fillStyle = star.isLucky ? '#fbbf24' : '#fef3c7'; // Gold or pale yellow
            
            // Draw Star Shape or simple Glow Circle
            // Simple Glow Circle is smoother for performance
            const r = star.radius * scale;
            
            // Outer Glow
            const gradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, r * 3);
            gradient.addColorStop(0, star.isLucky ? 'rgba(251, 191, 36, 0.8)' : 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = star.isLucky ? 0.8 : opacity;
            this.ctx.arc(star.x, star.y, r * 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Core
            this.ctx.beginPath();
            this.ctx.fillStyle = '#fff';
            this.ctx.globalAlpha = 1;
            this.ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw Particles
        this.particles.forEach(p => p.draw(this.ctx));
    }
}
