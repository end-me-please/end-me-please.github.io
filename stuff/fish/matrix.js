class Matrix {
    constructor(data) {
        this.data = data;
        this.rows = data.length;
        this.cols = data[0].length;
    }
    multiply(other) {
        if (this.cols != other.rows) {
            throw new Error("cols of first matrix must match rows of second: " + this.cols + " " + other.rows + "");
        }
        let result = new Matrix(Array(this.rows).fill(0).map(() => Array(other.cols).fill(0)));
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < other.cols; j++) {
                for (let k = 0; k < this.cols; k++) {
                    result.data[i][j] += this.data[i][k] * other.data[k][j];
                }
            }
        }
        return result;
    }
    add(other) {
        if (this.rows != other.rows || this.cols != other.cols) {
            throw new Error("matrix dimensions must match: " + this.rows + " " + other.rows + " " + this.cols + " " + other.cols + "");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < other.cols; j++) {
                this.data[i][j] += other.data[i][j];
            }
        }
    }
    map(func) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = func(this.data[i][j]);
            }
        }
    }
}