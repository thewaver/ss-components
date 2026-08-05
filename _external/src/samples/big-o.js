import React, { Component } from 'react';
import RandomAnimatedDiv from '../components/random-animated-div';
import { WeightFunc } from '../lib/weight-func';
import './big-o.css';

class BigO extends Component {
  render() {
    return (
      <div className="big-o">
        <RandomAnimatedDiv
          options={{
            weightFunc: WeightFunc.Random.Default 
          }}
        ></RandomAnimatedDiv>
      </div>
    );
  }
}

export default BigO;
