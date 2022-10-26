import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './style.css';

const Square = (props) => {
    return (
        <button className={props.doHightLight ? "hightLight square" : "square" }  onClick={props.onClick}>
            {props.value}
        </button>
    );
};

function checkHightlightSquare(index, winner ) {
    if (winner == null) return false;
    return (winner.winBy.filter(value => value == index).length > 0) ? true : false;
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                doHightLight={checkHightlightSquare(i, this.props.winner)}
            />
        );
    }

    render() {
        let boardTemplate = [];
        for (let row = 0; row < 3; row++){
            let rowTemplate = [];
            for (let column = 0; column < 3; column++) {
                const idSquare = row * 3 + column;
                rowTemplate.push(this.renderSquare(idSquare));
            }
            rowTemplate = (<div className='board-row'>{rowTemplate.slice()}</div>);
            boardTemplate.push(rowTemplate);
        }



        return (
            <div>
                {boardTemplate}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                    moveMark : null
                }
            ],
            stepNumber: 0,
            xIsNext: true,
            isAscending : true
        };

    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares, i) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([
                {
                    squares: squares,
                    moveMark : i
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            currentMoveIndex : i
        });
    }

    handleSortClick() {
        const previousIsAscending = this.state.isAscending;
        this.setState({
            isAscending : !previousIsAscending
        })
    }


    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    render() {
        let history =  this.state.history ;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares, current.moveMark);

        if (!this.state.isAscending) history = this.state.history.slice().reverse();
        const moves = history.map((step, move) => {
            let desc = "Go to game start";
            const moveIndex = (this.state.isAscending) ? move : history.length - 1 - move;

            if (step.moveMark !== null) {
                const position = convertIndexToPosition(step.moveMark);
                desc = `Go to move # ${moveIndex} at position (${position.row}, ${position.column})`;
            }
            const doHightlight = (this.state.stepNumber == moveIndex) ? true : false;
            return (
                <li key={moveIndex}>
                    <button  className={doHightlight ? 'hightLight' : ""} onClick={() => this.jumpTo(moveIndex)}>{desc}</button>
                </li>
            );
        });


        let status;
        if (this.state.stepNumber == 9) {
            status = "Draw";
        }
        else if (winner) {
            status = "Winner: " + winner.winner;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winner={winner}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => this.handleSortClick()}>{this.state.isAscending ? "Ascending" : "Descending"}</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function convertIndexToPosition(index) {
    if (index == -1) return null;
    const row =Math.floor(index / 3);
    const column = index % 3;
    return {row, column};
}

function convertPositionToIndex(row, column) {
    if (isOutside(row, column)) return -1;
    return row * 3 + column;
}

function isOutside(row, column) {
    if (row >= 3 || row < 0) return true;
    if (column >= 3 || column < 0) return true;
    return false;
}

function isValidPosition(squares, currentPosition, nextPosition) {
    if (!nextPosition || isOutside(nextPosition.row, nextPosition.column)) return false;
    const squareAtCurrentPosition = squares[convertPositionToIndex(currentPosition.row, currentPosition.column)];
    const squareAtNextPosition = squares[convertPositionToIndex(nextPosition.row, nextPosition.column)];
    if (squareAtNextPosition == squareAtCurrentPosition) return true;
    return false;
}

function calculateWinner(squares, currentMoveIndex) {
    if (currentMoveIndex == null || !squares[currentMoveIndex]) return null;
    // Bước 1 : Lấy được nước đi hiện tại => currentSquare
    // Bước 2 : Duyệt 4 hướng đi
    const drow = [-1, -1, 0, 1];
    const dcol = [0, 1, 1, 1];
    // Bước 3 : Xem coi hướng nào đi đúng
    let line = [];

    for (let direction = 0; direction < 4; direction++) {
        line =[currentMoveIndex];
        // Bước 3.1 : Lấy được position 2d hiện tại
        const currnetPosition = convertIndexToPosition(currentMoveIndex);
        // Bước 3.2 : Check xem hướng đi có hợp lệ hay không
        let count = 1;
        let nextPosition = convertIndexToPosition(convertPositionToIndex(currnetPosition.row + drow[direction], currnetPosition.column + dcol[direction]));
        while (isValidPosition(squares, currnetPosition, nextPosition)) {
            count++;
            line.push(convertPositionToIndex(nextPosition.row, nextPosition.column));

            nextPosition = convertIndexToPosition(convertPositionToIndex(nextPosition.row + drow[direction], nextPosition.column + dcol[direction]));
        }

        nextPosition = convertIndexToPosition(convertPositionToIndex(currnetPosition.row - drow[direction], currnetPosition.column - dcol[direction]));
        while (isValidPosition(squares, currnetPosition, nextPosition)) {
            count++;
            line.push(convertPositionToIndex(nextPosition.row, nextPosition.column));
            nextPosition = convertIndexToPosition(convertPositionToIndex(nextPosition.row - drow[direction], nextPosition.column - dcol[direction]));
        }

        if (count >= 3) return {"winner" : squares[currentMoveIndex], "winBy" : line};

    }
    return null;
}
