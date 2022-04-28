/*** docs exclude
 * Stopwatch data
 * @property {number} startTime requestAnimationFrame start time
 * @property {number} elapsedTime elapsed time = now time - start time
 * @property {number} frameTime requestAnimationFrame now time
 * @property {boolean} paused paused
 * @property {number} rafId return id from requestAnimationFrame
 * @property {object} event event items
 * @property {number[]} alarms set alarm times
 * @property {number[]} completeAlarms complete alarm times
 * @example
 * ```js
 * const stopwatch = new Stopwatch();
 * ```
 ***/

 class StopwatchData {

	// 필드
	startTime: number;
	elapsedTime: number;
	frameTime: number;
	paused: boolean;
	rafId: number;

	event: {
		update: Function[],
		alarm: Function[]
	};

	alarms: number[];
	completeAlarms: number[];


	constructor(){

		this.startTime = null;
		this.elapsedTime = null;
		this.frameTime = null;
		this.paused = false;
		this.rafId = null;
		this.event = {
			
			update: [],
			alarm: []
			
		};
		this.alarms = [];
		this.completeAlarms = [];

	}

}

export default StopwatchData;