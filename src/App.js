import React, {Component} from 'react';
import List from './List';
import {generateRandomList} from './utils';
import './App.css';
import 'react-virtualized/styles.css';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {list: generateRandomList()};
	}

	render() {
		return (
			<div className="App">
				<List {...this.state}/>
			</div>
		);
	}
}

export default App;
