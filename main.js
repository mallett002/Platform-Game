// Simple level
let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

// "." = empty space
// "#" = walls
// "@" = game character
// "+" = lava
// "o" = coins
// "=" = moving lava

// Class stores a level object.
// It's arg is the string that defines the level
class Level {
    constructor(plan) {
        // rows is an array of arrays of characters
        let rows = plan.trim().split("\n").map(l => [...l]); // put each item in l in an []
        this.height = rows.length;
        this.width = rows[0].length;
        // actors: moving elements stored here:
        this.startActors = []; // an array of objects

        // background: array of array of strings: "empty" "wall" "lava"
        this.rows = rows.map((row, y) => { // y tells us the y coord
            // map over the content in each row
            return row.map((ch, x) => { // x tells us the x coord
                // map background elements to strings, actor chars to classes
                let type = levelChars[ch];
                // if string, return it
                if (typeof type === "string") return type;
                // otherwise it's an actor, put it in the startActors array
                this.startActors.push(
                    // Dynamically create each actor 
                    type.create(new Vec(x, y), ch) 
                );
            });
        });
    }
}

// Actors will change places as game goes on. 
// Tracks the state of the running game
class State {
    constructor(level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status; // "playing", "lsot", or "won"
    }

    static start(level) {
        return new State(level, level.startActors, "playing");
    }

    get player() {
        // returns the player
        return this.actors.find(a => a.type === "player");
    }
}


// Vec class used for our 2 dimensional values (position and size of actors)
// pos = x, y and size = actor's size
class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    // Scales a vector by a given number
    times(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }
}

// Different types of actors get their own classes, since their behavior..
// ..is different.

// Player class: has a property "speed" that stores its current speed.
// Uses speed to simulate momentum and gravity
class Player {
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }

    get type() { return "player"; }

    // pos is a Vec instance
    static create(pos) {  // initial pos set to be .5 square above, to set it on bottom of square
        return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0)); // speed: 0
    }
}
// Size property is always the same
Player.prototype.size = new Vec(0.8, 1.5);

// Lava actor has create metod that looks at the character the Level
// constructor passes and creates the appropriate lava actor
class Lava {
    constructor(pos, speed, reset) {
        this.pos = pos;
        this.speed = speed;
        this.reset = reset;
    }

    get type() { return "Lava"; }

    static create(pos, ch) {
        // for static lava
        if (ch === "=") {
            return new Lava(pos, new Vec(2, 0));
            // bouncing lava
        } else if (ch === "|") {
            return new Lava(pos, new Vec(0, 2));
            // dripping lava ( has reset property )
        } else if (ch === "v") {
            return new Lava(pos, new Vec(0, 3), pos);
        }
    }
}
Lava.prototype.size = new Vec(1, 1);

// Coin Actors: Stationary, but have a "wobble". Stores a base psotion and a 
// wobble property to track the phase of the bouncing motion
class Coin {
    constructor(pos, basePos, wobble) {
        this.pos = pos;
        this.basePos = basePos;
        this.wobble = wobble;
    }

    get type() { return "coin"; }

    // pos arg will be a new Vec(x, y)
    static create(pos) {
        let basePos = pos.plus(new Vec(0.2, 0.1));
        // width of a wobble phase is 2 * PI. Multiply that by Math.random to give it..
        // ..a random starting position
        return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
    }
}
Coin.prototype.size = new Vec(0.6, 0.6);

// Maps plan characters to either background grid types or actor classes
const levelChars = {
    ".": "empty",
    "#": "wall",
    "+": "lava",
    "@": Player,
    "o": Coin,
    "=": Lava,
    "|": Lava,
    "v": Lava
};

let simpleLevel = new Level(simpleLevelPlan);
console.log(`${simpleLevel.width} by ${simpleLevel.height}`); //--> 22 by 9