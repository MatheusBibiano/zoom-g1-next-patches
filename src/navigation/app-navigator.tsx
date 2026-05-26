import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatchListScreen } from '../screens/patch-list-screen';
import { PatchDetailScreen } from '../screens/patch-detail-screen';
import { PatchFormScreen } from '../screens/patch-form-screen';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

export type RootStackParamList = {
  PatchList: undefined;
  PatchDetail: { id: number };
  PatchForm: { mode: 'create' } | { mode: 'edit'; id: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Manages native navigation routes for listing, details, and form screens
export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="PatchList"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontFamily: FONTS.technicalLabel,
          fontSize: 13,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="PatchList"
        component={PatchListScreen}
        options={{ title: 'ZOOM G1 PATCHES' }}
      />
      <Stack.Screen
        name="PatchDetail"
        component={PatchDetailScreen}
        options={{ title: 'DETALHES' }}
      />
      <Stack.Screen
        name="PatchForm"
        component={PatchFormScreen}
        options={{ title: 'GRAVAR PATCH' }}
      />
    </Stack.Navigator>
  );
};
