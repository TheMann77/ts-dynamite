import { Gamestate, BotSelection } from '../models/gamestate';

//Exploiting Water Avoiding Novices
//Water Attacking Dynamite Eventually

//Draw with p=0.2, c. 1900 round
//(>=)1 draw - 380
//2 draw - 76
//3 draw - 15.2
//4 draw - 3.0
//5 draw - .61


class Bot {
    private score: number[];
    private dyns: number[];
    private played;
    private roundValue;
    private oppo_draw_plays
    constructor() {
        this.score = [0,0];
        this.dyns = [100,100];
        this.played = [
            {'R': 0, 'P': 0, 'S': 0, 'D': 0, 'W': 0},
            {'R': 0, 'P': 0, 'S': 0, 'D': 0, 'W': 0}
        ];
        this.roundValue = 1;
        this.oppo_draw_plays = []
        for (let i = 0; i < 50; i++) {
            this.oppo_draw_plays.push({'D':0, 'W':0, 'O':0})
        }
    }

    private winner = {
        'R': {'R': 2, 'P': 1, 'S': 0, 'D': 1, 'W': 0},
        'P': {'R': 0, 'P': 2, 'S': 1, 'D': 1, 'W': 0},
        'S': {'R': 1, 'P': 0, 'S': 2, 'D': 1, 'W': 0},
        'D': {'R': 0, 'P': 0, 'S': 0, 'D': 2, 'W': 1},
        'W': {'R': 1, 'P': 1, 'S': 1, 'D': 0, 'W': 2},
    }

    makeMove(gamestate: Gamestate): BotSelection {
        //console.log(this.score);
        if (gamestate.rounds.length > 0) {
            const last_turn = gamestate.rounds[gamestate.rounds.length-1];
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
        const ave_rounds_left = (1000 - Math.max(this.score[0], this.score[1])) / 1000 * 1900;
        let threshold = 0;
        if (this.played[1]['W'] === 0) {
            let exp_consec_draws = [1000];
            for (let i = 0; i<10; i++) {
                exp_consec_draws.push(.8*(.2**i)*ave_rounds_left);
            }
            //console.log(exp_consec_draws);
            let s = 0;
            for (let i = exp_consec_draws.length - 1; i >= 0; i--) {
                s += exp_consec_draws[i];
                if (s>this.dyns[0]) {threshold = i; break;}
            }
            //
            //
            // console.log(s, this.dyns[0], threshold);
        }

        let opp_dyn_prob = 100/1900;
        let opp_water_prob = this.played[1]['W'] > 0 ? (25/1900) : 0;

        let dyn_prob;

        if (opp_water_prob > 0) {
            dyn_prob = Math.min(this.roundValue * this.dyns[0] / ave_rounds_left, 0.5);
        } else {
            dyn_prob = (this.roundValue >= threshold && this.dyns[0] > 0) ? 1 : 0;
        }

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
