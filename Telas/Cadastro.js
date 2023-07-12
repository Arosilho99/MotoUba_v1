import React, { useEffect, useState } from 'react';
import { View, Text ,StyleSheet,TextInput, Image} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../Connect';
import { Alert } from 'react-native';
import { getDatabase, ref, set } from "firebase/database";



const CadastroUsu = ({ navigation }) => {
  const [Email, onChangeEmail] = React.useState('');
  const [Senha, onChangeSenha] = React.useState('');
  const [Nome, onChangeNome] = React.useState('');
  const [Telefone, onChangeTelefone] = React.useState('');

  const database = getDatabase();

  const realtime = () => {
    const db = getDatabase();
    let replaceEmail = Email.replace(/@/g, '-');
    replaceEmail = replaceEmail.replace(/\./g, '-');

  set(ref(db, 'usuarios/'+replaceEmail +'/'), {
    NomeUsu: Nome,
    EmailUsu: Email,
    TelefoneUsu: Telefone,
    tipoUsu: ""
  })
 }


  return (
    
    <View style={styles.container}> 
    <Image source={require('../Material/Logo.png')}  style={styles.logo} />
    <TextInput style={styles.TextInput} onChangeText={onChangeEmail}  editable placeholder='Email' placeholderTextColor={'black'}
     value={Email}
    ></TextInput>
    <TextInput style={styles.TextInput} onChangeText={onChangeSenha}  value={Senha}  editable placeholder='Senha' placeholderTextColor={'black'}></TextInput>
    <TextInput style={styles.TextInput}  editable  placeholder='Nome completo'  placeholderTextColor={'black'} 
     value={Nome}
     onChangeText={onChangeNome}
    ></TextInput>
    <TextInput style={styles.TextInput}  keyboardType='number-pad' editable  placeholder='Telefone'  placeholderTextColor={'black'}
     value={Telefone}
     onChangeText={onChangeTelefone}

    ></TextInput>

    <TouchableOpacity onPress={() =>
      {createUserWithEmailAndPassword(auth, Email, Senha)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        const mensagem = ("Seja bem-vindo " + Email);
        Alert.alert('Usuario criado com sucesso',mensagem, [
          {text: 'OK'},
        ]);
        navigation.navigate('Login');
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert('Erro ao criar usuario','Tente novamente', [
          {text: 'OK'},

        ]);

        // ..
      }),realtime();}
    }>
        <Image source={require('../Material/button_cadastrar.png')}  style={styles.buttonok} />
    </TouchableOpacity>



    </View>
  );
};


export default CadastroUsu;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#c9c0c5',
      alignItems :'center',
      
    },
    logo:{
        left: 0,
        right: 0,
        top: -100,
        width: 400,
        height : 400,
      },
      buttonok:{
        marginLeft: 240,
        marginTop: 0,
        left: -120,
        right: 0,
        top: 0,
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
  });