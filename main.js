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
                // if actor 
                this.startActors.push(
                    // Position of actor stored as Vec object
                    type.create(new Vec(x, y), ch) // static create method "create"
                );
            });
        });
    }
}

