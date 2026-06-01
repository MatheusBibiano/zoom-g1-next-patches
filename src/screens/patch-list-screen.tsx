import React, { useState, useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { type Patch } from '../types/patch';
import { usePatches } from '../hooks/use-patches';
import { useToast } from '../hooks/use-toast';
import { patchesService } from '../database/patches-service';
import { PatchCard } from '../components/patch-card';
import { FilterBar } from '../components/filter-bar';
import { SkeletonCard } from '../components/skeleton-card';
import { DeleteModal } from '../components/delete-modal';

type RootStackParamList = {
  PatchList: undefined;
  PatchDetail: { id: number };
  PatchForm: { mode: 'create' } | { mode: 'edit'; id: number };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PatchList'
>;

// Renders the main dashboard screen listing all user guitar patches with search and CRUD options
export const PatchListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { showToast } = useToast();

  const {
    patches,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedSort,
    setSelectedSort,
    refetch,
  } = usePatches();

  const [patchToDelete, setPatchToDelete] = useState<Patch | null>(null);

  // Trigger refetch when screen gains active focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleCardPress = (id: number) => {
    navigation.navigate('PatchDetail', { id });
  };

  const handleCardEdit = (id: number) => {
    navigation.navigate('PatchForm', { mode: 'edit', id });
  };

  const handleCardDeletePress = (patch: Patch) => {
    setPatchToDelete(patch);
  };

  const handleConfirmDelete = async () => {
    if (!patchToDelete) return;

    try {
      await patchesService.remove(patchToDelete.id);
      showToast(`Patch "${patchToDelete.songName}" excluído`, 'danger');
      refetch();
    } catch (error) {
      console.error('Failed to delete patch:', error);
      showToast('Erro ao excluir o patch. Tente novamente.', 'danger');
    } finally {
      setPatchToDelete(null);
    }
  };

  // Writes all stored patches to a JSON file and prompts the OS sharing dialog
  const handleExport = async () => {
    try {
      const data = await patchesService.exportAll();
      const jsonString = JSON.stringify(data, null, 2);

      // Blobs and standard anchor tags are used to download the file on web platforms
      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'zoom_g1_patches.json';
        link.click();
        URL.revokeObjectURL(url);
        showToast('Patches exportados com sucesso!', 'success');
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}zoom_g1_patches.json`;
      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Exportar Patches ZOOM G1',
          UTI: 'public.json',
        });
      } else {
        showToast('Compartilhamento não disponível no dispositivo', 'danger');
      }
    } catch (error) {
      console.error('Error exporting patches:', error);
      showToast('Erro ao exportar os patches', 'danger');
    }
  };

  // Opens the OS document picker to select and import patches JSON file
  const handleImport = async () => {
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }

      const selectedFile = pickerResult.assets[0];
      let fileContent = '';

      // Leverages custom fetch on web and standard file systems on native for cross-platform compatibility
      if (Platform.OS === 'web') {
        const response = await fetch(selectedFile.uri);
        fileContent = await response.text();
      } else {
        fileContent = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      const parsedData = JSON.parse(fileContent);
      if (!Array.isArray(parsedData)) {
        showToast('Formato inválido: o arquivo deve ser um array de patches', 'danger');
        return;
      }

      const importedCount = await patchesService.importPatches(parsedData);
      if (importedCount > 0) {
        showToast(`${importedCount} patch(es) importados com sucesso!`, 'success');
        refetch();
      } else {
        showToast('Nenhum patch válido encontrado no arquivo', 'danger');
      }
    } catch (error) {
      console.error('Error importing patches:', error);
      showToast('Falha ao importar: verifique se o arquivo JSON é válido', 'danger');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleImport}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="file-import"
              size={18}
              color={COLORS.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionButtonText}>IMPORTAR JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExport}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="file-export"
              size={18}
              color={COLORS.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionButtonText}>EXPORTAR JSON</Text>
          </TouchableOpacity>
        </View>

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSort={selectedSort}
          onSortSelect={setSelectedSort}
          resultsCount={patches.length}
        />

        {isLoading ? (
          <FlatList
            data={[1, 2, 3]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonCard />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={patches}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <PatchCard
                patch={item}
                onPress={() => handleCardPress(item.id)}
                onEdit={() => handleCardEdit(item.id)}
                onDelete={() => handleCardDeletePress(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="guitar-electric"
                  size={50}
                  color={COLORS.textSecondary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>Nenhum patch encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery.length > 0
                    ? 'Tente ajustar sua busca para encontrar patches salvos.'
                    : 'Crie seu primeiro patch pressionando o botão "+" abaixo!'}
                </Text>
              </View>
            }
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('PatchForm', { mode: 'create' })}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#0E0E0F" />
        </TouchableOpacity>

        {patchToDelete && (
          <DeleteModal
            visible={!!patchToDelete}
            songName={patchToDelete.songName}
            onCancel={() => setPatchToDelete(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 85,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    height: 46,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.technicalLabel,
    fontSize: 11,
    letterSpacing: 1,
  },
});
