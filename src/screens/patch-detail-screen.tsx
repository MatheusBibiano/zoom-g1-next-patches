import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { type Patch } from '../types/patch';
import { patchesService } from '../database/patches-service';
import { useToast } from '../hooks/use-toast';
import { ModuleCard } from '../components/module-card';
import { DeleteModal } from '../components/delete-modal';

type RootStackParamList = {
  PatchList: undefined;
  PatchDetail: { id: number };
  PatchForm: { mode: 'create' } | { mode: 'edit'; id: number };
};

type RouteProp = {
  key: string;
  name: 'PatchDetail';
  params: { id: number };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PatchDetail'
>;

// Renders deep-dive patch technical parameters segmented into G1 modular sections
export const PatchDetailScreen = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { id } = route.params;
  const { showToast } = useToast();

  const [patch, setPatch] = useState<Patch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Queries current patch values
  const loadPatch = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await patchesService.getById(id);
      setPatch(data);
    } catch (error) {
      console.error('Failed to load patch by ID:', error);
      showToast('Erro ao carregar os detalhes do patch.', 'danger');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [id, navigation, showToast]);

  // Load patch data on focus
  useFocusEffect(
    useCallback(() => {
      loadPatch();
    }, [loadPatch])
  );

  const handleEditPress = useCallback(() => {
    navigation.navigate('PatchForm', { mode: 'edit', id });
  }, [id, navigation]);

  const handleDeletePress = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  // Sets custom header options (edit and delete buttons)
  useEffect(() => {
    if (patch) {
      navigation.setOptions({
        headerTitle: patch.songName,
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              onPress={handleEditPress}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={22}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeletePress}
              style={[styles.headerButton, styles.deleteButton]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color={COLORS.danger}
              />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [patch, navigation, handleEditPress, handleDeletePress]);

  const handleConfirmDelete = async () => {
    if (!patch) return;
    try {
      await patchesService.remove(patch.id);
      showToast(`Patch "${patch.songName}" excluído`, 'danger');
      navigation.navigate('PatchList');
    } catch (error) {
      console.error('Failed to delete patch:', error);
      showToast('Erro ao excluir o patch.', 'danger');
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (isLoading || !patch) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // Active status conditions
  const isCompActive = patch.compType !== null && patch.compType !== 'OFF';
  const isDriveActive = patch.driveType !== null && patch.driveType !== 'OFF';
  const isZnrActive = patch.znrType !== null && patch.znrType !== 'OFF';
  const isModActive = patch.modType !== null && patch.modType !== 'OFF';
  const isDelayActive = patch.delayType !== null && patch.delayType !== 'OFF';
  const isReverbActive = patch.reverbType !== null && patch.reverbType !== 'OFF';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.songMetadataCard}>
          <Text style={styles.songNameText}>{patch.songName}</Text>
          <Text style={styles.artistText}>{patch.artist}</Text>
        </View>

        {/* 1. PATCH LEVEL */}
        <ModuleCard
          title="PATCH LEVEL"
          type="MASTER LEVEL"
          isActive={patch.patchLevel !== null && patch.patchLevel > 0}
          parameters={[{ label: 'LEVEL', value: patch.patchLevel }]}
        />

        {/* 2. COMP/EFX */}
        <ModuleCard
          title="COMP/EFX"
          type={patch.compType}
          isActive={isCompActive}
          parameters={[{ label: 'PARAM', value: patch.compPrm }]}
        />

        {/* 3. DRIVE */}
        <ModuleCard
          title="DRIVE"
          type={patch.driveType}
          isActive={isDriveActive}
          parameters={[{ label: 'GAIN', value: patch.driveGain }]}
        />

        {/* 4. EQ */}
        <ModuleCard
          title="EQUALIZER"
          type="3-BAND EQ"
          isActive={true} // Always active
          parameters={[
            {
              label: 'LOW',
              value:
                patch.eqLow !== null && patch.eqLow > 0
                  ? `+${patch.eqLow}`
                  : patch.eqLow,
            },
            {
              label: 'MID',
              value:
                patch.eqMid !== null && patch.eqMid > 0
                  ? `+${patch.eqMid}`
                  : patch.eqMid,
            },
            {
              label: 'HIGH',
              value:
                patch.eqHigh !== null && patch.eqHigh > 0
                  ? `+${patch.eqHigh}`
                  : patch.eqHigh,
            },
          ]}
        />

        {/* 5. ZNR / AMP */}
        <ModuleCard
          title="ZNR/AMP"
          type={patch.znrType}
          isActive={isZnrActive}
          parameters={[{ label: 'PARAM', value: patch.znrPrm }]}
        />

        {/* 6. MODULATION */}
        <ModuleCard
          title="MODULATION"
          type={patch.modType}
          isActive={isModActive}
          parameters={[
            { label: 'PRM 1', value: patch.modPrm1 },
            { label: 'RATE', value: patch.modRate },
          ]}
        />

        {/* 7. DELAY */}
        <ModuleCard
          title="DELAY"
          type={patch.delayType}
          isActive={isDelayActive}
          parameters={[
            { label: 'PRM 1', value: patch.delayPrm1 },
            { label: 'TIME', value: patch.delayTime ? `${patch.delayTime}ms` : null },
          ]}
        />

        {/* 8. REVERB */}
        <ModuleCard
          title="REVERB"
          type={patch.reverbType}
          isActive={isReverbActive}
          parameters={[
            { label: 'PRM 1', value: patch.reverbPrm1 },
            { label: 'DECAY', value: patch.reverbDecay },
          ]}
        />
      </ScrollView>

      {showDeleteModal && (
        <DeleteModal
          visible={showDeleteModal}
          songName={patch.songName}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 6,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  songMetadataCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songNameText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyBold,
    fontSize: 20,
    marginBottom: 6,
    textAlign: 'center',
  },
  artistText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
  },
});
