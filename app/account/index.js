/**
 * Created by Yooz on 2017/3/13.
 */


import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Navigator,
    ListView,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
var Dimensions = require("Dimensions");
var {width, height} = Dimensions.get('window');
var Mock = require('mockjs');
var cacheResult = {
    nextPage: 1,
    items: [],
    total: 0
}
export default class Account extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2
            }),
            isMoreLoading: false    //是否正在加载更多数据
        }
    }

    static defaultProps = {
        uri_api: 'http://rap.taobao.org/mockjs/15752/init?reqParam=dog'
    }

    render() {
        return (
            <View style={{backgroundColor: 'rgba(240,239,245,1.0)', flex: 1}}>
                <View style={styles.accountTopStyles}>
                    <Text style={styles.accountTopTextStyles}>狗狗说</Text>
                </View>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow}
                    automaticallyAdjustContentInsets={false}
                    enableEmptySections={true}
                    onEndReached={() => this._fetchMore()}   //加载更多
                    onEndReachedThreshold={20}
                    renderFooter={() => this._renderFooter()}
                    showsVerticalScrollIndicator={false}    //隐藏纵向滚动条
                />
            </View>
        )
    }

    _renderFooter() {       //全部加载完毕的时候。
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

    _hasMore() {     //当视频总量，等于  已经缓存了的视频总量
        if (cacheResult.total <= cacheResult.items.length) {
            return false
        } else {    //当视频总量，不等于  已经缓存了的视频总量，说明还有数据
            return true;
        }
    }

    _fetchMore() {     //加载更多，如果没有了更多数据，或者正在加载数据的状态中，就return
        if (!this._hasMore() || this.state.isMoreLoading) {
            return null;
        }
        var page = cacheResult.nextPage;
        this.initData(page)
    }


    componentDidMount() {
        this.initData(1)
    }

    initData(page) {
        this.setState({
            isMoreLoading: true
        })
        fetch(this.props.uri_api + "&page=" + page)
            .then((response) => response.json())
            .then((response) => {
                var data = Mock.mock(response);
                this.parseData(data);
            })
            .catch((error) => {
                this.setState({
                    isMoreLoading: false
                });
                console.error(error)
            })
    }

    parseData(data) {
        var item = cacheResult.items.slice();  //把缓存中的item数组放到一个新的数组里面
        item = item.concat(data.data)           //item里面追加新加载的数据。
        cacheResult.items = item               //cacheResult里面放着所有加载的数据
        cacheResult.total = data.total
        setTimeout(()=> {
            this.setState({
                isMoreLoading: false,
                dataSource: this.state.dataSource.cloneWithRows(cacheResult.items)
            });
        }, 800)

    }

    _renderRow(rowData) {
        return (
            <View style={{marginBottom: 5}}>
                <View>
                    <View style={{backgroundColor: 'white', alignItems: 'center'}}>
                        <Text style={styles.accountTopItemTextStyles}>{rowData.title}</Text>
                    </View>
                    <Image style={styles.accountImgStyles} source={{uri: rowData.imgUrl}}/>
                    <Icon style={styles.play} size={30} name="ios-play"/>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={styles.accountBottomItemStyles}>
                        <Icon size={30} name="ios-heart-outline"/>
                        <Text style={{marginLeft: 10}}>喜欢</Text>
                    </View>
                    <View style={styles.accountBottomItemStyles}>
                        <Icon size={30} name="ios-chatboxes-outline"/>
                        <Text style={{marginLeft: 10}}>评论</Text>
                    </View>
                </View>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    play: {
        borderRadius: 25,
        borderColor: 'white',
        borderWidth: 1,
        color: 'orange',
        position: 'absolute',
        bottom: 15,
        right: 30,
        width: 40,
        height: 40,
        paddingTop: 5,
        paddingLeft: 15
    },
    accountTopItemTextStyles: {
        fontSize: 17,
        color: 'black',
        padding: 5,
    },
    accountBottomItemStyles: {
        backgroundColor: 'white',
        width: width / 2 - 1,
        height: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountImgStyles: {
        width: width,
        height: 200
    },
    accountTopTextStyles: {
        fontSize: 18,
        color: 'white'
    },
    accountTopStyles: {
        backgroundColor: 'orange',
        width: width,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
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
})
module.exports = Account;
