class tttGame{
    constructor(nn1, nn2){
        this.nn1 = nn1; //winner 1
        this.nn2 = nn2; //winner -1
        this.rowLength = 3;
        this.dead = false;

        this.board = [];
        for(let i = 0; i < this.rowLength; i++){
            this.board.push([]);
            for(let j = 0; j < this.rowLength; j++){
                this.board[i].push(0);
            }
        }
        this.lastnn2output = [0,0,0,0,0,0,0,0,0];


        this.turn = 1;
        this.winner = 0;
        this.stalemate = false;
    }
    runUntilDead(maxTurns){
        while(this.turn < maxTurns && this.winner == 0 && !this.stalemate){
            this.step();
        }
        if(this.stalemate){
            return 0;
        }
        return this.winner;
        
    }
    step(){
        //flatten board
        let flatBoard = [];
        for(let i = 0; i < this.board.length; i++){
            for(let j = 0; j < this.board[i].length; j++){
                flatBoard.push(this.board[i][j]);
            }
        }
        //the board is stored as -1, 0, +1
        //the network however gets 0, 0.5, 1 (0 being enemy, 0.5 being empty, 1 being self)
        let input1 = [];
        let input2 = [];
        for(let i = 0; i < flatBoard.length; i++){
            if(flatBoard[i] == 1){
                input1.push(1);
                input2.push(0);
            }else if(flatBoard[i] == -1){
                input1.push(0);
                input2.push(1);
            }else{
                input1.push(0.5);
                input2.push(0.5);
            }
        }
        let output1 = this.nn1.run(input1);
        //output is a 9 length array of probabilities
        //we need to find the highest probability that is a valid move
        let highestProb = -100;
        let highestIndex = -1;
        for(let i = 0; i < output1.length; i++){
            if(output1[i] > highestProb && this.board[Math.floor(i/3)][i%3] == 0){
                highestProb = output1[i];
                highestIndex = i;
            }
        }
        if(highestIndex == -1){
            this.stalemate = true;
            this.dead = true;
            return;
        }
        this.board[Math.floor(highestIndex/3)][highestIndex%3] = 1;
        //edit input for nn2
        input2[highestIndex] = 0;

        if(this.checkWin()){
            this.winner = 1;
            this.dead = true;

            return;
        }

        let output2 = this.nn2.run(input2);
        //output is a 9 length array of probabilities
        //we need to find the highest probability that is a valid move
        highestProb = -100;
        highestIndex = -1;
        for(let i = 0; i < output2.length; i++){
            if(output2[i] > highestProb && this.board[Math.floor(i/3)][i%3] == 0){
                highestProb = output2[i];
                highestIndex = i;
            }
        }
        if(highestIndex == -1){
            
            this.stalemate = true;
            this.dead = true;

            return;
        }
        this.board[Math.floor(highestIndex/3)][highestIndex%3] = -1;
        
        if(this.checkWin()){
            this.winner = -1;
            this.dead = true;

            return;
        }

    }

    simStep(index){
        let flatBoard = [];
        for(let i = 0; i < this.board.length; i++){
            for(let j = 0; j < this.board[i].length; j++){
                flatBoard.push(this.board[i][j]);
            }
        }
        let input2 = [];
        
        for(let i = 0; i < flatBoard.length; i++){
            if(flatBoard[i] == 1){
                input2.push(0);
            }else if(flatBoard[i] == -1){
                input2.push(1);
            }else{
                input2.push(0.5);
            }
        }
        input2[index] = 0;
        //clone memory
        let memoryBackup = [...this.nn2.memory];
        let output2 = this.nn2.run(input2);
        //restore memory
        this.nn2.memory = memoryBackup;
        this.lastnn2output = output2;
    }


    checkWin(){
        //check rows (use this.rowLength)
        for(let i = 0; i < this.rowLength; i++){
            let sum = 0;
            for(let j = 0; j < this.rowLength; j++){
                sum += this.board[i][j];
            }
            if(sum == this.rowLength){
                return true;
            }
            if(sum == -this.rowLength){
                return true;
            }
        }
        //check columns
        for(let i = 0; i < this.rowLength; i++){
            let sum = 0;
            for(let j = 0; j < this.rowLength; j++){
                sum += this.board[j][i];
            }
            if(sum == this.rowLength){
                return true;
            }
            if(sum == -this.rowLength){
                return true;
            }
        }
        //check diagonals
        let sum = 0;
        for(let i = 0; i < this.rowLength; i++){
            sum += this.board[i][i];
        }
        if(sum == this.rowLength){
            return true;
        }
        if(sum == -this.rowLength){
            return true;
        }
        sum = 0;
        for(let i = 0; i < this.rowLength; i++){
            sum += this.board[i][this.rowLength-1-i];
        }
        if(sum == this.rowLength){
            return true;
        }
        if(sum == -this.rowLength){
            return true;
        }
        return false;
    }
    render(context){
        let width = context.canvas.width;
        let height = context.canvas.height;
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        context.fillStyle = "#FFFFFF";
        context.fillRect(width/3, 0, 2, height);
        context.fillRect(2*width/3, 0, 2, height);
        context.fillRect(0, height/3, width, 2);
        context.fillRect(0, 2*height/3, width, 2);
        for(let i = 0; i < this.board.length; i++){
            for(let j = 0; j < this.board[i].length; j++){
                if(this.board[i][j] == 1){
                    context.fillStyle = "#FF0000";
                }else if(this.board[i][j] == -1){
                    context.fillStyle = "#0000FF";
                }else{
                    context.fillStyle = "#FFFFFF";
                }
                context.fillRect(j*width/3, i*height/3, width/3, height/3);
            }
        }
        //give the board a tint if we have a winner. gray for stalemate
        if(this.winner == 1){
            context.fillStyle = "#FF0000";
            context.globalAlpha = 0.5;
            context.fillRect(0, 0, width, height);
            context.globalAlpha = 1;
        }else if(this.winner == -1){
            context.fillStyle = "#0000FF";
            context.globalAlpha = 0.5;
            context.fillRect(0, 0, width, height);
            context.globalAlpha = 1;
        }else if(this.stalemate){
            context.fillStyle = "#FFFFFF";
            context.globalAlpha = 0.5;
            context.fillRect(0, 0, width, height);
            context.globalAlpha = 1;
        }
        //draw a thick black line through the winning row
        let winningRowPoints = this.getWinningRowPoints();
        if(winningRowPoints.length > 0){
            context.strokeStyle = "#000000";
            context.lineWidth = 5;
            context.beginPath();
            context.moveTo(winningRowPoints[0][1]*width/3 + width/6, winningRowPoints[0][0]*height/3 + height/6);
            for(let i = 1; i < winningRowPoints.length; i++){
                context.lineTo(winningRowPoints[i][1]*width/3 + width/6, winningRowPoints[i][0]*height/3 + height/6);
            }
            context.stroke();
        }
        //draw a gray blob of varying size at the last nn2 output
        context.fillStyle = "#AAAAAA";
        for(let i = 0; i < this.lastnn2output.length; i++){
            context.fillStyle = "#AAAAAA";
            //context.globalAlpha = this.lastnn2output[i];
            //normalize the values
            let minOut = Math.min(...this.lastnn2output);
            //set all the outputs that are occupied to minOut
            if(this.board[Math.floor(i/3)][i%3] != 0){
                this.lastnn2output[i] = minOut;
            }
            let maxOut = Math.max(...this.lastnn2output);
            let normOut = (this.lastnn2output[i] - minOut)/(maxOut - minOut);
            context.globalAlpha = normOut;
            //if max, set fillstyle to blue
            if(normOut == 1){
                context.fillStyle = "#0000FF";
            }
            context.beginPath();
            context.arc((i%3)*width/3 + width/6, Math.floor(i/3)*height/3 + height/6, 20, 0, 2*Math.PI);
            context.fill();
            //draw as number
            context.fillStyle = "#00FF00";
            context.font = "20px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.globalAlpha = 1;
            //toFixed + write the nn output
            context.fillText(this.lastnn2output[i].toFixed(2), (i%3)*width/3 + width/6, Math.floor(i/3)*height/3 + height/6);
        }
        context.globalAlpha = 1;

        

    }
    getWinningRowPoints(){
        //check in a way that allows arbitrary board size
        //(use this.rowLength)

        let winningRowPoints = [];
        for(let i = 0; i < this.rowLength; i++){
            let sum = 0;
            for(let j = 0; j < this.rowLength; j++){
                sum += this.board[i][j];
            }
            if(sum == this.rowLength){
                for(let j = 0; j < this.rowLength; j++){
                    winningRowPoints.push([i, j]);
                }
            }
            if(sum == -this.rowLength){
                for(let j = 0; j < this.rowLength; j++){
                    winningRowPoints.push([i, j]);
                }
            }
        }
        //check columns
        for(let i = 0; i < this.rowLength; i++){
            let sum = 0;
            for(let j = 0; j < this.rowLength; j++){
                sum += this.board[j][i];
            }
            if(sum == this.rowLength){
                for(let j = 0; j < this.rowLength; j++){
                    winningRowPoints.push([j, i]);
                }
            }
            if(sum == -this.rowLength){
                for(let j = 0; j < this.rowLength; j++){
                    winningRowPoints.push([j, i]);
                }
            }
        }
        //check diagonals
        let sum = 0;
        for(let i = 0; i < this.rowLength; i++){
            sum += this.board[i][i];
        }
        if(sum == this.rowLength){
            for(let i = 0; i < this.rowLength; i++){
                winningRowPoints.push([i, i]);
            }
        }
        if(sum == -this.rowLength){
            for(let i = 0; i < this.rowLength; i++){
                winningRowPoints.push([i, i]);
            }
        }
        sum = 0;
        for(let i = 0; i < this.rowLength; i++){
            sum += this.board[i][this.rowLength-1-i];
        }
        if(sum == this.rowLength){
            for(let i = 0; i < this.rowLength; i++){
                winningRowPoints.push([i, this.rowLength-1-i]);
            }
        }
        if(sum == -this.rowLength){
            for(let i = 0; i < this.rowLength; i++){
                winningRowPoints.push([i, this.rowLength-1-i]);
            }
        }
        return winningRowPoints;
    }

}