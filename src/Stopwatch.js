import AlarmType from "./Stopwatch.AlarmType.js";
import Degree from "./Stopwatch.Degree.js";

/**
 * 스탑워치 생성자
 * @constructor
 * @example
 * // 객체 생성
 * const stopwatch = new Stopwatch();
 * @property {number} startTime 시간 시작값  
 * @property {number} time 현재 시간  
 * @property {number} raf에서 반환되는 frame time  
 * @property {boolean} paused 일시정지 여부
 * @property {number} rafId requestAnimationFrame 아이디
 * @property {object} event 이벤트 모듈
 * @property {number[]} alarms 등록된 알람 시간
 * @property {number[]} completeAlarms 완료된 알람 시간
 */
class Stopwatch {

	startTime;
	time;
	frameTime;
	paused;
	rafId;
	event;
	alarms;
	completeAlarms;

	static AlarmType = AlarmType;
	static Degree = Degree;

	constructor(){
		
		const self = this;
		
		// 일시정지 여부
		this.paused = false;
		
		// 알람 설정 시간
		this.alarms = [];
		this.completeAlarms = [];
		
		// 이벤트 목록
		this.event = {
			
			// 콜백 목록
			update: [], // ( {number} time )
			alarm: [], // ( {number} time )
			
			execute( /** name, args... */ ){
				
				const args = Array.prototype.slice.call( arguments );
				const name = args.shift();
				const callbacks = this[ name ];
				
				// 콜백수행
				callbacks.forEach( cb => cb.apply( self, args ) );
				
			}
			
			
		};
		
	}

	/**
	 * @description 스탑워치 실행 시킵니다.
	 * @example
	 * // 스탑워치 실행
	 * stopwatch.start();
	 * @returns {boolean} 명령 수행 여부
	 */	
	start(){
		
		if( this.paused === true ){
			this.paused = false;
			return true;
		}
		
		// 현재 수행중인 경우, 다시 실행시킬 수 없음
		if( this.rafId != null ){
			return false;
		}
		
		const self = this;
		function frame( time ){
			
			self.rafId = window.requestAnimationFrame( frame );
			if( self.startTime == null ){
				self.startTime = time;
			}
			
			if( self.paused === true ){
				self.startTime += time - self.frameTime;
			}
			
			self.frameTime = time;
			self.time = time - self.startTime;
			self.event.execute( "update", self.time );
			
			const alarms = self.alarms.filter( alarmTime => {
				
				// 이미 알람을 발생한 경우
				const isComplete =  self.completeAlarms.some( cAlarmTime => cAlarmTime == alarmTime );
				
				if( isComplete ){
					return false;
				}
				
				return alarmTime <= self.time;
				
			} );
			
			for( let i=0; i<alarms.length; ++i ){
				
				self.event.execute( "alarm", self.time );
				self.completeAlarms.push( alarms[ i ] );
				
			}
			
		}
		
		self.rafId = window.requestAnimationFrame( frame );
		
		return true;
		
	}
	
	
	/**
	 * @description 스탑워치를 일시정지 시킵니다.
	 * @example
	 * // 스탑워치 일시중지
	 * stopwatch.pause();
	 * @returns {boolean} 명령 수행 여부
	 */	
	pause(){
		
		if( this.rafId == null ){
			return false;
		}
		
		if( this.paused === true ){
			return false;
		}
		
		this.paused = true;
		return true;
		
	}
	
	
	/**
	 * @description 스탑워치를 중지 시킵니다.
	 * @example
	 * // 스탑워치 중지
	 * stopwatch.stop();
	 * @returns {boolean} 명령 수행 여부
	 */	
	stop(){
		
		if( this.startTime == null ){
			return false;
		}
		
		window.cancelAnimationFrame( this.rafId );
		this.rafId = null;
		this.startTime = null;
		this.paused = false;
		this.completeAlarms = [];
		
		return true;
		
	}
	
	
	/**
	 * @description 현재시간을 반환합니다.
	 * @example
	 * // 스탑워치 시간 조회
	 * const time = stopwatch.get();
	 * @returns {number} 현재시간(ms)
	 */	
	get(){
		
		return this.time;
		
	}
	
	/**
	 * @description 알람을 설정합니다. 알람시간이 되면, 타이머에서 알람이벤트를 발생시킵니다.
	 * @example
	 * // 알람 설정 ( 알람종류: Stopwatch.AlarmType.RELATIVE )
	 * stopwatch.setAlarm( 3000 );
	 * @example
	 * // 알람 설정
	 * stopwatch.setAlarm( 3000, Stopwatch.AlarmType.ABSOLUTE );
	 * @param {number} alarmTime 알람시간(ms)
	 * @param {Stopwatch.AlarmType} [alarmType=Stopwatch.AlarmType.RELATIVE] 알람기준
	 * @returns {boolean} 명령 수행 여부
	 */	
	setAlarm( alarmTime, alarmType = Stopwatch.AlarmType.RELATIVE ){
		
		if( typeof alarmTime != "number" ){
			return false;
		}
		
		if( alarmTime <= 0 ){
			return false;
		}
		
		if( alarmType instanceof Stopwatch.AlarmType === false ){
			return false;
		}
		
		const time = this.get();

		/**
		 * @todo 특정 인스턴스에 해당되는 필터는 제거 필요
		 */
		if( 
			alarmType === Stopwatch.AlarmType.ABSOLUTE &&
			alarmTime <= time
		){
			return false;
		}
		
		alarmTime = alarmType.timeCalculation( time, alarmTime );
		this.alarms.push( alarmTime );
		
	}
	
	/**
	 * @description 저장된 알람을 전달합니다.
	 * @example
	 * // 알람 조회
	 * const alarms = stopwatch.getAlarms();
	 * @returns {number[]} 저장된 알람
	 */	
	getAlarms(){
		
		return this.alarms;
		
	}
	

	/**
	 * @description 설정된 모든 알람이 제거 됩니다.
	 * @example
	 * // 알람 초기화
	 * stopwatch.clearAlarm();
	 * @returns {boolean} 명령 수행 여부
	 */	
	clearAlarm(){
		
		this.alarms = [];
		this.completeAlarms = [];
		return true;
		
	}
	
	
	/**
	 * @description 이벤트 콜백을 등록합니다.
	 * @example
	 * // 시간이 갱신되면, 호출
	 * stopwatch.on( "update", ( ms ) => {
	 * 
	 *     const seconds = ms / 1000;
	 *     console.log( seconds.toFixed( 3 ) );
	 * 
	 * } );
	 * @param {string} eventName 등록할 이벤트명 ( 'update', 'alarm' ) 
	 * @param {function} callback 이벤트 발생 시, 수행될 콜백함수 
	 * @returns {boolean} 명령 수행 여부
	 */	
	on( eventName, callback ){
		
		const callbacks = this.event[ eventName ];
		
		// 등록가능한 이벤트명이 아님
		if( callbacks == null ){
			return false;
		}
		
		callbacks.push( callback );
		return true;
		
	}
	
	
	/**
	 * @description 이벤트 콜백을 삭제합니다.
	 * @example
	 * // 모든 콜백 제거
	 * stopwatch.off();
	 * @example
	 * // 특정 이벤트의 모든 콜백 제거
	 * stopwatch.off( "alarm" );
	 * @example
	 * // 특정 이벤트의 특정 콜백 제거
	 * stopwatch.off( "alarm", alarmListener );
	 * @param {string} eventName 삭제할 이벤트명 ( 'update', 'alarm' ) 
	 * @param {function} callback 삭제할 콜백함수 
	 * @returns {boolean} 명령 수행 여부
	 */	
	off( eventName, callback ){
		
		// 모든 이벤트 삭제
		if( eventName == null ){
			
			for( eventName in this.event ){
				
				this.event[ eventName ] = [];
				
			}
			
			return true;
			
		}

		// 특정 이벤트 삭제
		if( callback == null ){
			
			this.event[ eventName ] = [];
			return true;
			
		}
		
		// 특정 이벤트의 콜백 삭제
		const callbacks = this.event[ eventName ];
		const index = callbacks.indexOf( callback );
		callbacks.splice( index, 1 );
		return true;
		
	}
	
	
	
}


export default Stopwatch;