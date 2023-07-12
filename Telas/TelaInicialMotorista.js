import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDatabase, ref, get, child, push } from 'firebase/database';
import { useRoute } from '@react-navigation/native';


const TelaInicialMotorista = ({ navigation }) => {
  const [FormaPagamento, setFormaPagamento] = useState('');
  const [Inicio, setInicio] = useState('');
  const [Fim, setFim] = useState('');
  const [Motorista, setMotorista] = useState('');
  
  const route = useRoute();
  const { Login } = route.params;

  const realtimeConsulta = () => {
    const novaCorridaRef = push(corridasRef);
    const idCorrida = novaCorridaRef.key;

    const dbRef = ref(getDatabase());
    get(child(dbRef, idCorrida+'/')).then((snapshot) => {
      if (snapshot.exists()) {
        if (snapshot.val().EmailMotorista === Login) {
            const FormaPagamento = snapshot.val().FormaPagamento;
            const Inicio = snapshot.val().Inicio;
            const Fim = snapshot.val().Fim;
            const Motorista = snapshot.val().Motorista;
            setFormaPagamento(FormaPagamento);
            setInicio(Inicio);
            setFim(Fim);
            setMotorista(Motorista);
        }
        else{
            // console.log('No data available');

        }
      } else {
        console.log('No data available');
      }
    }).catch((error) => {
      console.error(error);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      realtimeConsulta();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.visualiza}>
      <Text>{FormaPagamento}</Text>
      <Text>{Inicio}</Text>
      <Text>{Fim}</Text>
      <Text>{Motorista}</Text>

    </View>
  );
};

const styles = StyleSheet.create({
  visualiza: {
    flex: 1,
    justifyContent: 'center',
    left: 10,
  },
});

export default TelaInicialMotorista;
