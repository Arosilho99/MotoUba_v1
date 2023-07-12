import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CadastroUsu from './Telas/Cadastro';
import TelaInicial from './Telas/TelaInicial';
import TelaInicialMotorista from './Telas/TelaInicialMotorista';
import LoginUsu from './Telas/Login';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login"  options={{ headerShown: false }}  component={LoginUsu} />
          <Stack.Screen name="Cadastro" component={CadastroUsu} />
          <Stack.Screen name="TelaInicial" component={TelaInicial}  options={{ headerShown: false }} />
          <Stack.Screen name="TelaInicialMotorista" component={TelaInicialMotorista}  options={{ headerShown: false }} />

        </Stack.Navigator>
      </NavigationContainer>

  );
}

