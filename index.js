class GameGraph {
    constructor(rows, columns, maze01) {
        this.nodes = [];
        this.rows = rows;
        this.columns = columns;
        this.cells = rows * columns;
        this.maze = this.readMaze01(maze01);
        
        this.init();
    }

    readMaze01 = maze01 => {
        return maze01
            .replace(/\s+/g, '')
            .split('')
            .map(c => parseInt(c, 10));
    }

    init = () => {
        for (let i = 0; i < this.cells; i++) {
            const node = [];
        
            if (i % this.columns !== 0) {
                node.push(i - 1);
            }
        
            if (i % this.columns !== this.columns - 1) {
                node.push(i + 1);
            }
        
            if (i >= this.columns) {
                node.push(i - this.columns);
            }
        
            if (i < this.cells - this.columns) {
                node.push(i + this.columns);
            }
        
            this.nodes.push(node);
        }
        
        this.buildWalls();
    }

    buildWalls = () => {
        const bricks = [];
        for (let i = 0; i < this.cells; i++) {
            if (this.maze[i] === 0) {
                bricks.push(i);
            }
        }

        for (let i = 0; i < this.cells; i++) {
            if (bricks.includes(i)) {
                this.nodes[i] = [];
            } else {
                this.nodes[i] = this.nodes[i].filter(n => !bricks.includes(n));
            }
        }
    }

    isBrick = i => !this.nodes[i].length;

    getRandomPosition = () => {
        let random;

        do {
            random = Math.floor(Math.random() * (0, this.cells));
        } while (this.isBrick(random))
    
        return random;
    };

    getAllPathCells = () => {
        const all = [];
        for (let i = 0; i < this.cells; i++) {
            if (!this.isBrick(i)) {
                all.push(i);
            }
        }
        
        return all;
    }

    // Пошук у ширину
    findPathBFS = (start, end) => {
        let steps = 0;

        if (Array.isArray(end) && end.includes(start)) {
            return { path: [start, start], steps };
        }

        if (start === end) {
            return { path: [start, end], steps };
        }
    
        let queue = [start],
            visited = {},
            predecessor = {},
            tail = 0,
            path;
    
        while (tail < queue.length) {
            let u = queue[tail++];
            if (!this.nodes[u]) {
                continue;
            }
    
            let neighbors = this.nodes[u];
            for (let i = 0; i < neighbors.length; ++i) {
                let v = neighbors[i];
    
                if (visited[v]) {
                    continue;
                }
                
                visited[v] = true;
                steps++;
                
                if (v === end || (Array.isArray(end) && end.includes(v))) {
                    path = [v];
                    while (u !== start) {
                        path.push(u);
                        u = predecessor[u];
                    }
    
                    path.push(u);
                    path.reverse();
                    return { path, steps };
                }
                
                predecessor[v] = u;
                queue.push(v);
            }
        }
    
        return { path, steps };
    }

    // Пошук у глибину
    findPathDFS = (start, end) => {
        let steps = 0;
        const stack = [];
        const visited = {};
        const predecessor = {};
        const path = [];
        let node;

        stack.push(start);
        visited[start] = true;

        while (stack.length) {
            node = stack.pop();

            if (node === end) {
                path.push(node);
                while (node !== start) {
                    path.push(node);
                    node = predecessor[node];
                }

                path.push(node);
                path.reverse;
                return { path, steps };
            }

            this.nodes[node].forEach(n => {
                if (!visited[n]) {
                    steps++;
                    stack.push(n);
                    predecessor[n] = node;
                    visited[n] = true;
                }
            });
        }

        return { path, steps };
    }
}

class Game {
    constructor() {
        this.rows = 29;
        this.columns = 26;
        this.graph = new GameGraph(this.rows, this.columns, MAZE01);

        this.ctx = document.getElementById('maze').getContext('2d');
        this.levelEl = document.querySelector('.level');
        this.scoreEl = document.querySelector('.score');
        this.levelEl.textContent = 1;
        this.scoreEl.textContent = 0;

        this.level = 1;

        this.pacmanIndex = null;
        this.pacman = null;

        this.ghostsIndexes = [];
        this.ghosts = [];

        this.points = [];
        this.score = 0;

        this.start();
    }

    start = () => {
        this.clearCanvas();
        this.drawMaze();
        
        this.pacmanIndex = this.graph.getRandomPosition();
        this.pacman = this.getCellPosition(this.pacmanIndex);
        this.drawPacman();

        this.points = this.graph.getAllPathCells().filter(i => i !== this.pacmanIndex);
        this.drawPoints();

        for (let i = 0; i < this.level; i++) {
            this.ghostsIndexes[i] = this.getRandomPos();
            this.ghosts[i] = this.getCellPosition(this.ghostsIndexes[i]);
        }
        
        this.drawGhosts();
        setTimeout(() => {
            const nextPI = this.minimax(this.pacmanIndex, this.ghostsIndexes, 0, 2, true, this.pacmanIndex).pacman;
            const nextPP = this.getCellPosition(nextPI);
            const nextGI = this.ghostsIndexes.map(g => this.minimax(this.pacmanIndex, [g], 0, 2, false, this.pacmanIndex).ghost);
            const nextGP = nextGI.map(this.getCellPosition);
            this.run(nextPI, nextPP, nextGI, nextGP);
        }, 1000);
    }

    // не такий як у пакмена
    getRandomPos = () => {
        let p;

        do {
            p = this.graph.getRandomPosition();
        } while (p === this.pacmanIndex);
        
        return p;
    }

    getCellPosition = i => ({
        x: (i % this.columns) * 20,
        y: Math.floor(i / this.columns) * 20
    })

    drawMaze = () => {
        this.ctx.fillStyle = 'black';
        for (let i = 0; i < this.graph.nodes.length; i++) {
            if (this.graph.isBrick(i)) {
                const brick = this.getCellPosition(i);
                this.ctx.fillRect(brick.x, brick.y, 20, 20);
            }
        }
    }

    drawPacman = () => {
        this.ctx.beginPath();
        this.ctx.fillStyle = 'yellow';
        this.ctx.arc(this.pacman.x + 10, this.pacman.y + 10, 9, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fill();
    }

    drawGhosts = () => {
        this.ctx.fillStyle = 'gray';
        this.ghosts.forEach(g => {
            this.ctx.beginPath();
            this.ctx.fillRect(g.x + 3, g.y + 3, 14, 14);
        })
    }

    drawPoints = () => {
        this.ctx.fillStyle = 'orange';
        this.points.forEach(i => {
            const p = this.getCellPosition(i);
            this.ctx.beginPath();
            this.ctx.arc(p.x + 10, p.y + 10, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    minimax = (pacman, ghost, depth, maxDepth, isPacman, from) => {
        const result = {
            pacman,
            ghost,
            distance: isPacman ? -Infinity : Infinity,
        };

        if (depth === maxDepth) {
            // середнє арифметичне відстаней до привидів
            const distanceToGhost = ghost.reduce((sum, g) => {
                const d = this.graph.findPathBFS(pacman, g).path.length;
                return sum + d;
            }, 0) / ghost.length;

            // кількість балів, що заробить пакмен, якщо піде цим шляхом
            const points = this.graph.findPathBFS(from, pacman).path.filter(c => this.points.includes(c)).length;

            // відстань до найближчого балу
            const distanceToPoints = this.graph.findPathBFS(pacman, this.points).path.length

            return {
                pacman, 
                ghost, 
                distance: distanceToGhost + points - distanceToPoints / 2
            };
        }

        if (isPacman) {
            this.graph.nodes[pacman].forEach(n => {
                const distance = this.minimax(n, ghost, depth + 1, maxDepth, false, from).distance;

                if (distance > result.distance) {
                    result.pacman = n;
                    result.distance = distance;
                }
            });

            return result;
        } else {
            depth++
            const ghostsCombinations = combineArrays(ghost.map(g => this.graph.nodes[g]));

            ghostsCombinations.forEach(c => {
                const distance = this.minimax(pacman, c, depth, maxDepth, true, from).distance;
                
                if (distance < result.distance) {
                    result.ghost = c;
                    result.distance = distance;
                }
            })
            
            return result;
        }
    }

    move = (pos, newPos, speed = 5) => {
        const position = { ...pos };

        let top = false;
        let right = false;
        let bottom = false;
        let left = false;

        if (newPos.x > pos.x) {
            right = true;
        } else if (newPos.x < pos.x) {
            left = true;
        } else if (newPos.y > pos.y) {
            bottom = true;
        } else if (newPos.y < pos.y) {
            top = true;
        }

        if (top) { 
            position.y -= speed;
            if (position.y <= newPos.y) {
                position.y = newPos.y;
            }
        }

        if (bottom) { 
            position.y += speed;
            if (position.y >= newPos.y) {
                position.y = newPos.y;
            }
        }

        if (right) { 
            position.x += speed;
            if (position.x >= newPos.x) { 
                position.x = newPos.x;
            }
        }

        if (left) { 
            position.x -= speed;
            if (position.x <= newPos.x) {
                position.x = newPos.x;
            }
        }

        return position;
    }

    checkGhostsPositions = (g1, g2) => g1.every((g, index) => g.x === g2[index].x && g.y === g2[index].y);

    run = (pI, pP, gI, gP) => {
        let nextPI = pI;
        let nextPP = pP;
        let nextGI = gI;
        let nextGP = gP;

        // пакмен дістався позиції, визначає наступну
        if (this.pacman.x === pP.x && this.pacman.y === pP.y) {
            this.pacmanIndex = pI;

            // пакмен отримує бал
            if (this.points.includes(this.pacmanIndex)) {
                this.points.splice(this.points.indexOf(this.pacmanIndex), 1);
                this.score++;
                this.scoreEl.textContent = this.score;

                // пакмен переміг, зібравши усі бали
                if (!this.points.length) {
                    this.level++;
                    this.score = 0;
                    this.levelEl.textContent = this.level;
                    this.start();
                    return;
                }
            }

            nextPI = this.minimax(this.pacmanIndex, this.ghostsIndexes, 0, 2, true, this.pacmanIndex).pacman;
            nextPP = this.getCellPosition(nextPI);
        }

        // привиди дісталися позиції, визначають наступні
        if (this.checkGhostsPositions(this.ghosts, gP)) {
            this.ghostsIndexes = gI;

            // З ймовірністю 0.25 наступний крок привида буде обраний випадково
            if (Math.random() > 0.25) {
                nextGI = this.ghostsIndexes.map(g => this.minimax(this.pacmanIndex, [g], 0, 2, false, this.pacmanIndex).ghost);
            } else {
                nextGI = this.ghostsIndexes.map(g => randomItem(this.graph.nodes[g]))
            }

            nextGP = nextGI.map(this.getCellPosition);
        }

        this.pacman = this.move(this.pacman, nextPP);
        this.ghosts = this.ghosts.map((g, i) => this.move(g, nextGP[i]));

        this.clearCanvas();

        this.drawMaze();
        this.drawPoints();
        this.drawPacman();
        this.drawGhosts();

        const id = requestAnimationFrame(() => {
            this.run(nextPI, nextPP, nextGI, nextGP);
        });

        // привід наздогнав пакмена
        if (this.ghosts.some(g => {
            return Math.abs((this.pacman.x + 10) - (g.x + 10)) <= 16
                && Math.abs((this.pacman.y + 10) - (g.y + 10)) <= 16;
        })) {
            cancelAnimationFrame(id);
        }
    };

    clearCanvas = () => this.ctx.clearRect(0, 0, 520, 580);
}

const game = new Game();