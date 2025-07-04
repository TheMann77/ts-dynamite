import { Gamestate, BotSelection } from '../models/gamestate';

//Randomly Using Dynamite On Low Probability Hits

class Bot {
    private score: number[];
    private dyns: number[];
    private played;
    private roundValue;
    constructor() {
        this.score = [0,0];
        this.dyns = [100,100];
        this.played = [
            {'R': 0, 'P': 0, 'S': 0, 'D': 0, 'W': 0},
            {'R': 0, 'P': 0, 'S': 0, 'D': 0, 'W': 0}
        ];
        this.roundValue = 1;
    }

    private winner = {
        'R': {'R': 2, 'P': 1, 'S': 0, 'D': 1, 'W': 0},
        'P': {'R': 0, 'P': 2, 'S': 1, 'D': 1, 'W': 0},
        'S': {'R': 1, 'P': 0, 'S': 2, 'D': 1, 'W': 0},
        'D': {'R': 0, 'P': 0, 'S': 0, 'D': 2, 'W': 1},
        'W': {'R': 1, 'P': 1, 'S': 1, 'D': 0, 'W': 2},
    }

    makeMove(gamestate: Gamestate): BotSelection {
        if (gamestate.rounds.length > 0) {
            const last_turn = gamestate.rounds[gamestate.rounds.length-1];
            //console.log(last_turn);
            const last_winner = this.winner[last_turn.p1][last_turn.p2];

            if (last_winner !== 2) {
                this.score[last_winner] += this.roundValue;
                this.roundValue = 1;
            } else {this.roundValue++}
            if (last_turn.p1 === 'D') this.dyns[0] -= 1;
            if (last_turn.p2 === 'D') this.dyns[1] -= 1;
            this.played[0][last_turn.p1] += 1;
            this.played[1][last_turn.p2] += 1;
        }
        //console.log(this.score);
        //console.log(this.dyns);
        //console.log(this.played);
        const ave_rounds_left = (1000 - Math.max(this.score[0], this.score[1])) / 1000 * 1900;
        const dyn_prob = Math.min((this.roundValue-1) * 5 * this.dyns[0] / ave_rounds_left, 0.5);

        if (Math.random() < dyn_prob) {return 'D'}
        else {
            const r = Math.random();
            if (r < 1/3) {return 'R'}
            else if (r < 2/3) {return 'P'}
            else {return 'S'}
        }
    }
}

export = new Bot();
