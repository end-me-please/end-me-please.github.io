class terraingen {
    constructor(tilesize, seed) {
        this.tilesize = tilesize;
        this.seed = seed;
        this.noise = new Noise(seed,1);
    }
    tileTypes = {};
}
class tile {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.state = {};
    }
}
class tileType {
    constructor(name, texture) {
        this.name = name;
        this.texture = texture;
    }
}
class Noise {
    constructor(seed, scale) {
        this.seed = seed;
        this.scale = scale;
        this.rand = Random(seed);
        this.permutation = [];
        for (var i = 0; i < 512; i++) {
            this.permutation[i] = Math.floor(this.rand.next().value*512);
            
        }
    }
    get(x, y) {
        return this.perlin2(x / this.scale, y / this.scale);
    }
    
    perlin2(x, y) {
        let p = this.permutation;
        var X = Math.floor(x) & 255, // FIND UNIT CUBE THAT
            Y = Math.floor(y) & 255, // CONTAINS POINT.
            x = x - Math.floor(x), // FIND RELATIVE X,Y,Z
            y = y - Math.floor(y), // OF POINT IN CUBE.
            u = fade(x), // COMPUTE FADE CURVES
            v = fade(y), // FOR EACH OF X,Y,Z.
            A = p[X] + Y, AA = p[A], AB = p[A + 1], // HASH COORDINATES OF
            B = p[X + 1] + Y, BA = p[B], BB = p[B + 1]; // THE 8 CUBE CORNERS,

        return lerp(v, lerp(u, grad(p[AA], x, y), // AND ADD
            grad(p[BA], x - 1, y)), // BLENDED
            lerp(u, grad(p[AB], x, y - 1), // RESULTS
            grad(p[BB], x - 1, y - 1))); // FROM  8
        //missing functions
        function fade(t) {
            return t * t * t * (t * (t * 6 - 15) + 10);
        }
        function lerp(t, a, b) {
            return a + t * (b - a);
        }
        function grad(hash, x, y) {
            var h = hash & 15; // CONVERT LO 4 BITS OF HASH CODE
            var u = h < 8 ? x : y, // INTO 12 GRADIENT DIRECTIONS.
                v = h < 4 ? y : h == 12 || h == 14 ? x : 0;
            return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
        }
    }
}

function* Random (seed) {
    while (true) {
        seed = (seed * 9301 + 49297) % 233280;
        //make sure that the yielded value is between 0 and 1
        yield seed / 233280;
    }
}






















