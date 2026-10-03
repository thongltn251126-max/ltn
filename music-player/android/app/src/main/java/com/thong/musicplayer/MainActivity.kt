package com.thong.musicplayer

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.delay

private val Bg=Color(0xFF0B0B0F);private val Panel=Color(0xFF19191D);private val Pink=Color(0xFFFF375F)
data class Track(val title:String,val artist:String,val uri:Uri)
class MainActivity:ComponentActivity(){private lateinit var player:ExoPlayer;override fun onCreate(b:Bundle?){super.onCreate(b);player=ExoPlayer.Builder(this).build();setContent{MusicPlayerScreen(player)}};override fun onDestroy(){player.release();super.onDestroy()}}

@Composable fun MusicPlayerScreen(player:ExoPlayer){
 var tracks by remember{mutableStateOf(listOf<Track>())};var current by remember{mutableStateOf<Track?>(null)};var playing by remember{mutableStateOf(false)};var online by remember{mutableStateOf("")};var tab by remember{mutableStateOf("Nghe ngay")}
 val picker=rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()){uris->tracks=tracks+uris.map{Track(it.lastPathSegment?.substringAfterLast('/')?:"Media","Thiết bị",it)}}
 LaunchedEffect(player){while(true){playing=player.isPlaying;delay(250)}}
 fun play(t:Track){current=t;player.setMediaItem(MediaItem.fromUri(t.uri));player.prepare();player.play()}
 Surface(Modifier.fillMaxSize(),color=Bg){Column{
  Row(Modifier.fillMaxWidth().padding(18.dp),verticalAlignment=Alignment.CenterVertically){Text("Music",fontSize=25.sp,fontWeight=FontWeight.Bold,modifier=Modifier.weight(1f));Text("S22 Ultra",color=Color.Gray,fontSize=12.sp)}
  Row(Modifier.fillMaxWidth().padding(horizontal=12.dp),horizontalArrangement=Arrangement.spacedBy(8.dp)){listOf("Nghe ngay","Thư viện","Nhạc Online").forEach{t->FilterChip(selected=tab==t,onClick={tab=t},label={Text(t)})}}
  AnimatedContent(targetState=tab,transitionSpec={fadeIn()+scaleIn() togetherWith fadeOut()},modifier=Modifier.weight(1f),label="page"){page->Column(Modifier.fillMaxSize().padding(18.dp)){
   when(page){
    "Nghe ngay"->{Text("Nghe ngay",fontSize=30.sp,fontWeight=FontWeight.Bold);Spacer(Modifier.height(18.dp));Text("Music Player",color=Pink);Spacer(Modifier.height(20.dp));if(tracks.isEmpty())EmptyCard("Thêm nhạc hoặc video từ điện thoại")else TrackList(tracks,current,::play)}
    "Thư viện"->{Text("Thư viện",fontSize=30.sp,fontWeight=FontWeight.Bold);Spacer(Modifier.height(16.dp));Button(onClick={picker.launch(arrayOf("audio/*","video/*"))}){Text("＋ Thêm nhạc / video")};Spacer(Modifier.height(16.dp));TrackList(tracks,current,::play)}
    else->{Text("Nhạc Online",fontSize=30.sp,fontWeight=FontWeight.Bold);Spacer(Modifier.height(12.dp));OutlinedTextField(value=online,onValueChange={online=it},modifier=Modifier.fillMaxWidth(),label={Text("URL audio / video trực tiếp")});Spacer(Modifier.height(10.dp));Button(onClick={if(online.isNotBlank()){val t=Track("Online Media","Online",Uri.parse(online));tracks=tracks+t;play(t)}}){Text("Thêm & phát")};Spacer(Modifier.height(12.dp));Text("Dùng URL file media trực tiếp được phép truy cập.",color=Color.Gray,fontSize=12.sp)}
   }
  }}
  PlayerBar(current,playing,{if(player.isPlaying)player.pause()else player.play()})
 }}
}
@Composable fun TrackList(items:List<Track>,current:Track?,onPlay:(Track)->Unit){LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)){items(items){t->Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(if(t==current)Color(0xFF2A2025)else Panel).padding(13.dp),verticalAlignment=Alignment.CenterVertically){Column(Modifier.weight(1f)){Text(t.title,fontWeight=FontWeight.SemiBold);Text(t.artist,color=Color.Gray,fontSize=12.sp)}TextButton(onClick={onPlay(t)}){Text("▶",color=Pink)}}}}}
@Composable fun EmptyCard(text:String){Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Panel).padding(30.dp),contentAlignment=Alignment.Center){Text(text,color=Color.Gray)}}
@Composable fun PlayerBar(track:Track?,playing:Boolean,onPlay:()->Unit){Column(Modifier.fillMaxWidth().background(Panel).padding(14.dp)){Row(verticalAlignment=Alignment.CenterVertically){Column(Modifier.weight(1f)){Text(track?.title?:"Chưa phát nhạc",fontWeight=FontWeight.Bold);Text(track?.artist?:"Thêm media để bắt đầu",color=Color.Gray,fontSize=12.sp)}FilledIconButton(onClick=onPlay,colors=IconButtonDefaults.filledIconButtonColors(containerColor=Color.White,contentColor=Color.Black)){Text(if(playing)"Ⅱ"else"▶")}};Spacer(Modifier.height(8.dp));LinearProgressIndicator(progress={if(playing)1f else 0f},modifier=Modifier.fillMaxWidth(),color=Pink,trackColor=Color(0xFF3A3A40))}}
