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
        };

    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
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
            currentSquare : i
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const moves = history.map((step, move) => {
            let desc = "Go to game start";
            if (step.moveMark !== null) {
                const position = convertIndexToPosition(step.moveMark);
                desc = `Go to move (${position.row}, ${position.column})`;
            }
            const doHightlight = (this.state.stepNumber == move) ? true : false;
            return (
                <li key={move}>
                    <button  className={doHightlight ? 'hightLight' : ""} onClick={() => this.jumpTo(move)}>{desc}</button>
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
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function convertIndexToPosition(index) {
    const row =Math.floor(index / 3);

    const column = index % 3;
    return {row, column};
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {"winner" : squares[a], "winBy" : lines[i]};
        }
    }
    return null;
}
