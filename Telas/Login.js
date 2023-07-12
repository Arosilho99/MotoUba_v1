import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View,Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth } from '../Connect';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react';
import React from 'react';
import { useNavigation } from '@react-navigation/native';




const LoginUsu = ({ navigation }) => {

    const [Login, onChangeLogin] = React.useState('');
    const [Senha, onChangeSenha] = React.useState('');



    const PassaEmail = () => {
      navigation.navigate('TelaInicial', { Login });
      navigation.navigate('TelaInicialMotorista', { Login });


    };
    


    return (
        <View style={styles.container}> 
        <Image source={require('../Material/Logo.png')}  style={styles.logo} />
        <TextInput value={Login} onChangeText={onChangeLogin} autoComplete='email' editable placeholder='Login' placeholderTextColor={'black'} style={styles.TextInput}></TextInput>
        <TextInput value={Senha}  secureTextEntry={true} onChangeText={onChangeSenha} autoComplete='password' editable placeholder='Senha' placeholderTextColor={'black'} style={styles.TextInput}></TextInput>
      <TouchableOpacity onPress={() =>  {signInWithEmailAndPassword(auth, Login, Senha)
        .then((userCredential) => {
          // Signed in
          if(Login == 'adm@motouba.com.br'){
            const user = userCredential.user;
            console.log("Usuario Logado com sucesso")
            navigation.navigate('TelaInicialMotorista',{Login});
          }else{
          const user = userCredential.user;
          console.log("Usuario Logado com sucesso")
          navigation.navigate('TelaInicial',{Login});
            }

          // ...
        })
        .catch((error) => {
          console.log("Erro")
          Alert.alert('Usuario ou senha invalidos', 'Tente Novamente', [
            {text: 'OK'},
          ]);
  
  
        })}}>
        <Image source={require('../Material/button_entrar.png')}  style={styles.buttonok} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Image source={require('../Material/button_cadastrar.png')}  style={styles.buttonok} />
        </TouchableOpacity>
        <Text style={styles.footer}>@Todos os Direitos Reservador 2023</Text>
        <StatusBar style="auto" />
      </View>
    );
  };

  export default LoginUsu;

  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#c9c0c5',
      alignItems :'center',
      
    },
    titulo:{
        color : 'red',
        
       },
    logo:{
      left: 0,
      right: 0,
      top: -100,
      width: 400,
      height : 400,
    },
    TextInput:{
      borderWidth: 1,
      borderRadius : 50,
      backgroundColor : 'white',
      fontSize : 20,
      width: '90%',
      height : 40,
      textAlign : 'center',
      marginBottom: 10,
      left: 0,
      right: 0,
      top: -100,
      },
      buttonok:{
        marginLeft: 240,
        marginTop: 10,
        left: -120,
        right: 0,
        top: -100,
      },
  
      footer:{
        opacity: 0.5
        ,
        position: 'absolute',
        left: '20%',
        right: 0,
        bottom: 0
      }
  });