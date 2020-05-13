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

    // Пошук у ширину
    findPathBFS = (start, end) => {
        let steps = 0;
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
                
                if (v === end) {
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
        this.findPathButton = document.querySelector('.findPathButton');
        this.timeText1 = document.querySelector('.time1');
        this.stepsText1 = document.querySelector('.steps1');
        this.timeText2 = document.querySelector('.time2');
        this.stepsText2 = document.querySelector('.steps2');

        this.pacmanIndex = null;
        this.pacman = null;
        this.pacmanPathIndex = null;

        this.goalIndex = null;
        this.goal = null;

        this.path = null;
        this.pathDFS = null;

        this.start();
        this.findPathButton.addEventListener('click', this.findPath);
    }

    start = () => {
        this.clearCanvas();
        this.drawMaze();
        
        this.pacmanIndex = this.graph.getRandomPosition();
        this.pacman = this.getCellPosition(this.pacmanIndex);
        this.drawPacman();

        this.goalIndex = this.graph.getRandomPosition()
        this.goal = this.getCellPosition(this.goalIndex);
        this.drawGoal();
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

    drawGoal = () => {
        this.ctx.beginPath();
        this.ctx.fillStyle = 'red';
        this.ctx.arc(this.goal.x + 10, this.goal.y + 10, 7, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fill();
    }
    
    drawPath = (alg = true) => {
        this.ctx.fillStyle = alg ? 'rgba(51, 204, 51, 0.3)' :  'rgba(255, 0, 0, 0.3)';
        const path = alg ? this.path : this.pathDFS;

        path.forEach(cell => {
            const p = this.getCellPosition(cell);
            this.ctx.fillRect(p.x, p.y, 20, 20);
        });
    }

    findPath = () => {
        this.findPathButton.disabled = true;

        const start1 = performance.now();
        const bfs = this.graph.findPathBFS(this.pacmanIndex, this.goalIndex);
        const end1 = performance.now();

        this.path = bfs.path;
        this.timeText1.textContent = (end1 - start1).toFixed(2);
        this.stepsText1.textContent = bfs.steps;
        
        const start2 = performance.now();
        const dfs = this.graph.findPathDFS(this.pacmanIndex, this.goalIndex)
        const end2 = performance.now();

        this.pathDFS = dfs.path;
        this.timeText2.textContent = (end2 - start2).toFixed(2);
        this.stepsText2.textContent = dfs.steps;

        this.drawPath();
        this.drawPath(false);
        this.drawGoal();
        this.drawPacman();

        setTimeout(() => {
           this.animatePacman(1);
        }, 1000);
    }

    animatePacman = cell => {
        let index = cell;
        const newPos = { ...this.pacman };
        const to = this.getCellPosition(this.path[index]);
        const movement = 2;

        let top = false;
        let right = false;
        let bottom = false;
        let left = false;

        const isTo = () => {
            newPos.x = to.x;
            newPos.y = to.y;
            this.pacman = { ...newPos };
            this.pacmanIndex = this.path[index];
            index++;
        };

        if (to.x > this.pacman.x) {
            right = true;
        } else if (to.x < this.pacman.x) {
            left = true;
        } else if (to.y > this.pacman.y) {
            bottom = true;
        } else if (to.y < this.pacman.y) {
            top = true;
        }

        if (top) { 
            newPos.y -= movement;
            if (newPos.y <= to.y) {
                isTo();
            }
        }

        if (bottom) { 
            newPos.y += movement;
            if (newPos.y >= to.y) {
                isTo();
            }
        }

        if (right) { 
            newPos.x += movement;
            if (newPos.x >= to.x) { 
                isTo();
            }
        }

        if (left) { 
            newPos.x -= movement;
            if (newPos.x <= to.x) {
                isTo();
            }
        }

        this.pacman = { ...newPos };
        
        this.clearCanvas();

        this.drawMaze();
        this.drawPath();
        this.drawPath(false);
        this.drawGoal();
        this.drawPacman();

        const id = requestAnimationFrame(() => {
            this.animatePacman(index);
        });

        if (newPos.x === this.goal.x && newPos.y == this.goal.y) {
            this.findPathButton.disabled = false;
            this.start();
            cancelAnimationFrame(id);
        }
    };

    clearCanvas = () => this.ctx.clearRect(0, 0, 520, 580);
}

const game = new Game();