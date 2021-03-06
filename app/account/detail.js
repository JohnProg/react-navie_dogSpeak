/**
 * Created by Yooz on 2017/3/24.
 */

import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Navigator,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    ListView,
    TextInput,
    Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from 'react-native-button';
var Video = require('react-native-video').default;
var Mock = require('mockjs');
var Dimensions = require("Dimensions");
var {width, height} = Dimensions.get('window');

var cacheResult = {
    nextPage: 1,
    items: [],
    total: 0
}

export default class detail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2
            }),
            progress: 0.01,  //转换后的当前进度。
            currentTime: 0, //当前播放进度
            totalTime: 0,    //总共播放进度
            isLoading: true,  //是否正在加载
            paused: false,     //是否正在播放，false为暂停。
            isEnding: false,   //是否播放完毕


            isMoreLoading: false,    //是否正在加载更多数据

            //modal
            modalVisible: false,
            content: '',
            isSending: false,         //是否正在发送
        }
    }

    static defaultProps = {
        pinglun_api: 'http://rap.taobao.org/mockjs/15752/pinglun?reqParam=233',
        submit_api: 'http://rap.taobao.org/mockjs/15752/submit'
    }

    render() {
        return (
            <View style={{backgroundColor: 'rgba(240,239,245,1.0)', flex: 1}}>
                <View style={styles.accountTopStyles}>
                    <TouchableOpacity activeOpacity={0.7}
                                      style={{position: 'absolute', left: 16,flexDirection:'row',alignItems: 'center'}}
                                      onPress={() => this.props.navigator.pop()}>
                        <Icon size={35} style={{color: 'white'}} name="ios-arrow-back"/>
                        <Text style={{fontSize:16,color:'white',marginLeft:5}}>返回</Text>
                    </TouchableOpacity>
                    <Text style={styles.accountTopTextStyles}>详情页</Text>
                </View>
                <View style={styles.viedoBox}>
                    {/*<Text style={styles.detailTitle}>{this.props.data.title}</Text>*/}
                    <TouchableOpacity activeOpacity={0.9} onPress={()=>this._paused()}>
                        <Video
                            ref="videoPlayer"
                            source={{uri: this.props.data.videoUrl}}
                            volume={3}  //声音放大倍数
                            paused={this.state.paused}  //是否暂停，一进来就播放。
                            rate={this.state.isRate}    //控制暂停/播放，0 代表暂停paused, 1代表播放normal.
                            muted={false}    //静音
                            repeat={false}      //是否重复播放
                            resizeMode='cover'  //视频拉伸方式， contain：包含
                            playInBackground={false}     // 当app转到后台运行的时候，播放是否暂停
                            playWhenInactive={false}     // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
                            style={styles.backgroundVideo}
                            onLoadStart={()=>this._onLoadStart()}      //当视频开始加载时的回调函数
                            onLoad={(data)=>this._onLoad(data)}           //当视频加载完毕时的回调函数
                            onProgress={(data)=>this._onProgress(data)}       //播放中每250毫秒调用一次
                            onEnd={()=>this._onEnd()}            //播放结束的时候调用
                            onError={()=>this._onError()}          //播放出错调用
                        />
                    </TouchableOpacity>
                    {
                        this.state.paused ?
                            <TouchableOpacity activeOpacity={0.5} style={styles.playBox}
                                              onPress={()=>this._resume()}>
                                <Icon style={styles.play} size={60}
                                      name="ios-play"/>
                            </TouchableOpacity> : null
                    }

                    {
                        this.state.isLoading ?
                            <ActivityIndicator style={{height: 80}} size="small"/> : null
                    }

                    <View style={styles.progressBox}>
                        <View style={[styles.progressBar,{width:width * this.state.progress}]}>
                        </View>
                    </View>
                </View>
                <View style={{flex :1}}>
                    <ScrollView>
                        <View style={{flexDirection:'row',padding:8}}>
                            <Image style={styles.authorStyles} source={{uri:this.props.data.authorImg}}/>
                            <View style={{flexDirection:'column',width:width*0.7,marginLeft:5,justifyContent:'center'}}>
                                <Text style={{color:'black',fontSize:14}}>{this.props.data.author}</Text>
                                <Text>{this.props.data.description}</Text>
                            </View>
                        </View>
                        <ListView
                            dataSource={this.state.dataSource}
                            renderRow={this._renderRow}
                            automaticallyAdjustContentInsets={false}
                            enableEmptySections={true}
                            onEndReached={() => this._fetchMore()}   //加载更多
                            onEndReachedThreshold={20}
                            showsVerticalScrollIndicator={false}    //隐藏纵向滚动条
                            renderFooter={() => this._renderFooter()}
                            renderHeader={()=>this._renderHeader()}
                        />
                    </ScrollView>
                </View>

                <Modal
                    animationType={"slide"}         //modal弹出的动画
                    visible={this.state.modalVisible}       //是否可见
                    onRequestClose={()=>this._onRequestClose()}           //关闭的时候调用
                >

                    <View style={styles.modalContainer}>
                        <TouchableOpacity onPress={()=>this._touchModal()}>
                            <Icon size={60} name="ios-close-outline"/>
                        </TouchableOpacity>
                        <TextInput
                            placeholder="来评论一下啊。"
                            style={styles.textInput}
                            multiline={true}            //是否可以输入多行文字
                            defaultValue={this.state.content}

                            onChangeText={(text)=>{
                                this.setState({
                                    content:text
                                })
                            }}
                        />
                        <Button
                            containerStyle={{padding:10, height:45, width:width*0.8,overflow:'hidden', borderRadius:4, backgroundColor: 'white',borderWidth:2,borderColor:'red',paddingBottom:3 }}
                            style={{fontSize: 20, color: 'green'}}
                            onPress={()=>this._submit()}>
                            发送
                        </Button>

                        {this.state.isSending ?
                            <ActivityIndicator style={{height: 180}} size="small"/> : null
                        }
                    </View>
                </Modal>
            </View>
        )
    }

    _touchModal = () => {
        this.setState({
            modalVisible: false
        })
    }

    _submit = () => {

        if (this.state.content.length == 0)
            return alert("评论不能为空")

        if (this.state.isSending)
            return alert("正在评论中");

        this.setState({
            isSending: true
        })
        fetch(this.props.submit_api, {
            method: "POST",
            body: "accessToken=Nikhil&content=" + this.state.content + "&reviewers=easytoguess"
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    var items = cacheResult.items.slice();//先拿到之前的item
                    items = [{          //在前面拼接一条数据。
                        comment: '悠哉,',
                        commentImg: 'https://dummyimage.com/640x640/70b984)',
                        content: this.state.content
                    }].concat(items)

                    cacheResult.items = items           //拼接后，设置新的缓存数据。
                    cacheResult.total = cacheResult.total + 1
                    this.setState({
                        content: '',
                        modalVisible: false,
                        dataSource: this.state.dataSource.cloneWithRows(cacheResult.items),
                        isSending: false
                    })
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }

    _renderHeader = () => {
        return (
            <View>
                <View>
                    <TextInput
                        placeholder="来评论一下啊。"
                        style={styles.textInput}
                        multiline={true}            //是否可以输入多行文字
                        onFocus={()=>this._onFocus()}   //输入框获得焦点
                    />
                </View>
                <View style={{padding:8}}>
                    <Text style={{fontSize:12,color:'black'}}>精彩评论</Text>
                    <View style={styles.lineStyles}></View>
                </View>
            </View>
        )
    }

    _onRequestClose = () => {

    }

    _onFocus = () => {
        if (!this.state.modalVisible) {
            this.setState({
                modalVisible: true
            })
        }
    }

    _renderFooter = () => {       //全部加载完毕的时候。
        if (!this._hasMore() && cacheResult.total !== 0) {
            return <View>
                <Text style={{fontSize: 15, color: 'gray', textAlign: 'center'}}>已经没有更多数据了</Text>
            </View>
        }

        if (!this.state.isMoreLoading) {
            return <View></View>
        }

        return <ActivityIndicator style={{height: 80}} size="small"/>
    }

    _hasMore = () => {     //当视频总量，等于  已经缓存了的视频总量
        if (cacheResult.total <= cacheResult.items.length) {
            return false
        } else {    //当视频总量，不等于  已经缓存了的视频总量，说明还有数据
            return true;
        }
    }

    _fetchMore = () => {
        if (!this._hasMore() || this.state.isMoreLoading) {
            return null;
        }
        var page = cacheResult.nextPage;
        this._fetch(page)
    }

    _renderRow = (rowData, sectionID, rowID, highlightRow) => {
        return (
            <View style={{flexDirection:'row',padding:8}}>
                <Image style={styles.commentStyles} source={{uri:rowData.commentImg}}/>
                <View style={{flexDirection:'column',width:width*0.85,marginLeft:5,justifyContent:'center'}}>
                    <Text style={{color:'black',fontSize:10}}>{rowData.comment}</Text>
                    <Text>{rowData.content}</Text>
                </View>
            </View>
        )
    }

    componentDidMount() {
        this._fetch(1)
    }

    _fetch = (page) => {
        if (page !== 0) {       //如果page不等于0，说明不是下拉刷新，只设置加载更多就行了
            this.setState({
                isMoreLoading: true,
            })
        }

        fetch(this.props.pinglun_api)
            .then((response) => response.json())
            .then((response) => {
                var data = Mock.mock(response);
                var item = cacheResult.items.slice();  //把缓存中的item数组放到一个新的数组里面
                if (page !== 0) {
                    item = item.concat(data.data)           //item里面追加新加载的数据。
                    cacheResult.nextPage += 1
                } else {
                    item = data.data
                }
                cacheResult.items = item               //cacheResult里面放着所有加载的数据
                cacheResult.total = data.total
                setTimeout(() => {
                    if (page !== 0) {
                        this.setState({
                            isMoreLoading: false,
                            dataSource: this.state.dataSource.cloneWithRows(cacheResult.items)
                        })
                    }
                }, 300)
            })
            .catch((error) => {
                if (page !== 0) {
                    this.setState({
                        isMoreLoading: false,
                    })
                }
                console.error(error)
            })
    }

    _rePlay = () => {
        this.refs.videoPlayer.seek(0)
    }

    _paused = () => {
        if (!this.state.isLoading) {
            if (!this.state.paused) {
                this.setState({
                    paused: true
                })
            }
        }
    }

    _resume = () => {
        if (this.state.paused) {
            this.setState({
                paused: false
            })
        }
        if (this.state.isEnding) {
            this._rePlay()
        }
    }

    _onLoadStart = () => {
        this.setState({
            isLoading: true
        })
    }

    _onLoad = (data) => {
        // var totalTime = data.duration
    }

    _onProgress = (data) => {
        // var currentTime = Number(data.currentTime.toFixed(2))
        var currentTime = data.currentTime
        var playableDuration = data.playableDuration
        //比例数，整数，
        // var percent = Number((currentTime / this.state.totalTime).toFixed(2));
        // alert(JSON.stringify(data));
        // alert(playableDuration);
        var percent = currentTime / this.state.totalTime;
        this.setState({
            totalTime: playableDuration,    //视频加载完毕，设置视频总长度
            currentTime: currentTime,
            progress: percent,
            isLoading: false,
            isEnding: false
        })
    }

    _onEnd = () => {
        this.setState({
            paused: true,
            isEnding: true
        })
    }

    _onError = () => {
        alert("视频出错了，很抱歉")
    }

}


const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center'
    },
    textInput: {
        width: width * 0.98,
        height: 130,
        borderWidth: 1,
        borderRadius: 3,
        borderColor: '#ccc',
    },
    commentStyles: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    lineStyles: {
        width: width,
        height: 3,
        backgroundColor: 'rgba(0,0,0,0.07)'
    },
    authorStyles: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    playBox: {
        position: 'absolute',
        bottom: 137,
        right: 150,
        width: 70,
        height: 70,
    },
    play: {
        borderRadius: 35,
        borderColor: 'white',
        borderWidth: 1,
        color: 'orange',
        paddingTop: 3,
        paddingLeft: 25,
    },
    progressBox: {
        width: width,
        height: 3,
        backgroundColor: '#ccc'
    },
    progressBar: {
        height: 3,
        backgroundColor: 'red'

    },
    detailTitle: {
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 10,
        fontSize: 16,
        color: 'black'
    },
    viedoBox: {
        width: width,
        height: 300
    },
    backgroundVideo: {
        width: width,
        height: 300
    },
    tabView: {
        flex: 1,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.01)',
    },
    card: {
        borderWidth: 1,
        backgroundColor: '#fff',
        borderColor: 'rgba(0,0,0,0.1)',
        margin: 5,
        height: 150,
        padding: 15,
        shadowColor: '#ccc',
        shadowOffset: {width: 2, height: 2,},
        shadowOpacity: 0.5,
        shadowRadius: 3,
    },
    accountTopTextStyles: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center'
    },
    accountTopStyles: {
        backgroundColor: 'orange',
        width: width,
        height: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
module.exports = detail;
