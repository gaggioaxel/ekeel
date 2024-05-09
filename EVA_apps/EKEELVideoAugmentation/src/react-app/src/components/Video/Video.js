import React from 'react';
import ReactPlayer from 'react-player';
import DotFactory from './Overlay-dot/DotFactory';
import './Video.css'

/**
 * React Component used by the App Component.
 * this component :
 *  - display a youtube Player andthe dot-timestamp overlay 
 *  - send every second the current timestamp of the vido to the rest of the app
 */
export default class Video extends React.Component {

    constructor() {
        super();
        this._isMounted = false
        this.playerDivRef = React.createRef();
        this.channel = new BroadcastChannel('react-connect');
        this.currentVideoTimeChannel = new BroadcastChannel("videoCurrentTime");
        this.channel.onmessage = res => {
          if(res.data.to === 'Video'){
            if(res.data.msg){
            this.setState({time: res.data.msg})
            try {
              this.goToInputTime(res.data.msg)
            } catch (error) {
              console.log(error)
            }
          }}
        }
        this.state= {
          // current timestamp of the video
          videoCurrentTime: 0,
          // list of the dots
          dotArray:[],
          duration: 0
        };

        this.dotsChannel = new BroadcastChannel("dots");
        this.dotsChannel.onmessage = res => {
          this.updateDotArray(res.data)
        }
    }

    interval = null;

    componentDidMount() {
      this._isMounted = true
      this.updateVideoCurrentTime()
    }

    //send every second the current timestamp of the vido to the rest of the app via a BroadcastChannel
    updateVideoCurrentTime = () => {
      if(this._isMounted){
        this.interval = setInterval(() => {
          const currentVideoTime = this.player.getCurrentTime();
          if (currentVideoTime !== this.state.videoCurrentTime){
            this.setState({videoCurrentTime: currentVideoTime});
            this.currentVideoTimeChannel.postMessage(currentVideoTime);
          }
        }, 1000); 
      }
    }

    //change the current timestamp of the video with the one in input
    goToInputTime = (time) => {
        var hms = time;   // your input string
        var a = hms.split(':'); // split it at the colons
    
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
        this.player.seekTo(seconds, 'seconds');
      }

    
      ref = player => {
        this.player = player
      }

      /**
       * update the array "dotArray" used by the DotFactory component to display or not dots
       * @param dotArrayInput array sent by the GraphKnowledge component (through a BroadcastChannel) to tell the Video component to display or not dots
       */
      updateDotArray = (dotArrayInput)=>{
        let tempArray = []
        if(this.state.duration){
          dotArrayInput.forEach(
            (item, index, array) =>{
              var a = item.time.split(':'); // split it at the colons
    
              // minutes are worth 60 seconds. Hours are worth 60 minutes.
              let timeInSec = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
        
              let percent = 100*timeInSec/this.state.duration
              let finalLeft = Math.round((percent*0.945 + 2) * 100) /100 
              if(finalLeft< 96.5){
                tempArray.push({ backgroundColor: item.backgroundColor , size: item.size, left: finalLeft+'%'})
              }}
          )
          this.setState({dotArray: tempArray});
        }
      }

      componentWillUnmount(){
        this._isMounted = false
        clearInterval(this.interval)
      }


    render () {
       return(
           <div ref={this.playerDivRef} className= "video">
               <DotFactory dotArray={this.state.dotArray} />             
               <ReactPlayer
                    ref={this.ref}
                    playing={true}
                    url={this.props.url+"?start="+this.props.lastWatchTime}
                    width='98%'
                    height='98%'
                    controls = {true}
                    /*onStart ={() => this.updateVideoCurrentTime()} */
                    onDuration = {(input) => this.setState({duration: input})}
                    config={{
                      youtube: {
                        playerVars: { controls: 1 }
                      }
                    }}
                 />
           </div>
       )
    }
  }