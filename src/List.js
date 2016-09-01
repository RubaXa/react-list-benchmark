import React, {Component} from 'react';
import {AutoSizer, InfiniteLoader, VirtualScroll} from 'react-virtualized';
import shallowCompare from 'react-addons-shallow-compare';
import styles from './List.css';

const STATUS_LOADING = 1;
const STATUS_LOADED = 2;

export default class InfiniteLoaderExample extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loadedRowCount: 0,
			loadedRowsMap: {},
			loadingRowCount: 0,
			randomScrollToIndex: null
		};

		this._timeoutIdMap = {};

		this._clearData = this._clearData.bind(this);
		this._isRowLoaded = this._isRowLoaded.bind(this);
		this._loadMoreRows = this._loadMoreRows.bind(this);
		this._rowRenderer = this._rowRenderer.bind(this);
	}

	componentWillUnmount() {
		Object.keys(this._timeoutIdMap).forEach(timeoutId => {
			clearTimeout(timeoutId)
		});
	}

	render() {
		const {list} = this.props;

		return (
			<InfiniteLoader
				isRowLoaded={this._isRowLoaded}
				loadMoreRows={this._loadMoreRows}
				rowCount={list.length}
			>
				{({onRowsRendered, registerChild}) => (
					<AutoSizer>
						{({width, height}) => (
							<VirtualScroll
								ref={registerChild}
								className={styles.VirtualScroll}
								onRowsRendered={onRowsRendered}
								rowCount={list.length}
								rowHeight={30}
								rowRenderer={this._rowRenderer}
								width={width}
								height={height}
							/>
						)}
					</AutoSizer>
				)}
			</InfiniteLoader>
		);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return shallowCompare(this, nextProps, nextState);
	}

	_clearData() {
		this.setState({
			loadedRowCount: 0,
			loadedRowsMap: {},
			loadingRowCount: 0
		})
	}

	_isRowLoaded({index}) {
		const {loadedRowsMap} = this.state;
		return true || !!loadedRowsMap[index]; // STATUS_LOADING or STATUS_LOADED
	}

	_loadMoreRows({startIndex, stopIndex}) {
		const {loadedRowsMap, loadingRowCount} = this.state;
		const increment = stopIndex - startIndex + 1;
		let promiseResolver;

		for (var i = startIndex; i <= stopIndex; i++) {
			loadedRowsMap[i] = STATUS_LOADING;
		}

		this.setState({
			loadingRowCount: loadingRowCount + increment
		});

		const timeoutId = setTimeout(() => {
			const {loadedRowCount, loadingRowCount} = this.state;

			delete this._timeoutIdMap[timeoutId];

			for (var i = startIndex; i <= stopIndex; i++) {
				loadedRowsMap[i] = STATUS_LOADED;
			}

			this.setState({
				loadingRowCount: loadingRowCount - increment,
				loadedRowCount: loadedRowCount + increment
			});

			promiseResolver();
		}, 1);

		this._timeoutIdMap[timeoutId] = true;

		return new Promise(resolve => {
			promiseResolver = resolve;
		});
	}

	_rowRenderer({index}) {
		const {list} = this.props;
		const {loadedRowsMap} = this.state;

		const row = list[index];
		let content;

		if (1 || loadedRowsMap[index] === STATUS_LOADED) {
			content = row.name;
		} else {
			content = (
				<div
					className={styles.placeholder}
					style={{width: row.size}}
				/>
			);
		}

		return (
			<div
				key={index}
				className={styles.row}
				style={{height: 30}}
			>
				{content}
			</div>
		);
	}
}
