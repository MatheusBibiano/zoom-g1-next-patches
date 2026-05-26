import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import {
  COMP_EFX_TYPES,
  DRIVE_TYPES,
  ZNR_AMP_TYPES,
  MODULATION_TYPES,
  DELAY_TYPES,
  REVERB_TYPES,
} from '../constants/effect-types';
import { patchesService } from '../database/patches-service';
import { useToast } from '../hooks/use-toast';

const EQUALIZER_MIN = -18;
const EQUALIZER_MAX = 18;

// Definition of standard schemas using Zod for guitar patch forms
const patchSchema = z.object({
  songName: z.string().min(1, 'Nome da música é obrigatório'),
  artist: z.string().min(1, 'Artista é obrigatório'),
  patchLevel: z.number().min(0).max(100),

  compType: z.string(),
  compPrm: z.number().min(0).max(9).nullable(),

  driveType: z.string(),
  driveGain: z.number().min(0).max(30).nullable(),

  eqLow: z.number().min(EQUALIZER_MIN).max(EQUALIZER_MAX),
  eqMid: z.number().min(EQUALIZER_MIN).max(EQUALIZER_MAX),
  eqHigh: z.number().min(EQUALIZER_MIN).max(EQUALIZER_MAX),

  znrType: z.string(),
  znrPrm: z.number().min(0).max(9).nullable(),

  modType: z.string(),
  modPrm1: z.number().min(0).max(9).nullable(),
  modRate: z.number().min(10).max(2000).nullable(),

  delayType: z.string(),
  delayPrm1: z.number().min(0).max(9).nullable(),
  delayTime: z.number().min(10).max(5000).nullable(),

  reverbType: z.string(),
  reverbPrm1: z.number().min(0).max(9).nullable(),
  reverbDecay: z.number().min(1).max(30).nullable(),
});

type PatchFormValues = z.infer<typeof patchSchema>;

type RootStackParamList = {
  PatchList: undefined;
  PatchDetail: { id: number };
  PatchForm: { mode: 'create' } | { mode: 'edit'; id: number };
};

type RouteProp = {
  key: string;
  name: 'PatchForm';
  params: { mode: 'create'; id?: number } | { mode: 'edit'; id: number };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PatchForm'
>;

export const PatchFormScreen = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { mode, id } = route.params;
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    'METADATA'
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PatchFormValues>({
    resolver: zodResolver(patchSchema),
    defaultValues: {
      songName: '',
      artist: '',
      patchLevel: 50,
      compType: 'OFF',
      compPrm: null,
      driveType: 'OFF',
      driveGain: null,
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      znrType: 'OFF',
      znrPrm: null,
      modType: 'OFF',
      modPrm1: null,
      modRate: null,
      delayType: 'OFF',
      delayPrm1: null,
      delayTime: null,
      reverbType: 'OFF',
      reverbPrm1: null,
      reverbDecay: null,
    },
  });

  // Load existing patch values if edit mode
  useEffect(() => {
    const fetchExistingPatch = async () => {
      if (mode === 'edit' && id) {
        try {
          setIsLoading(true);
          const patchData = await patchesService.getById(id);
          reset({
            songName: patchData.songName,
            artist: patchData.artist,
            patchLevel: patchData.patchLevel ?? 50,
            compType: patchData.compType ?? 'OFF',
            compPrm: patchData.compPrm,
            driveType: patchData.driveType ?? 'OFF',
            driveGain: patchData.driveGain,
            eqLow: patchData.eqLow ?? 0,
            eqMid: patchData.eqMid ?? 0,
            eqHigh: patchData.eqHigh ?? 0,
            znrType: patchData.znrType ?? 'OFF',
            znrPrm: patchData.znrPrm,
            modType: patchData.modType ?? 'OFF',
            modPrm1: patchData.modPrm1,
            modRate: patchData.modRate,
            delayType: patchData.delayType ?? 'OFF',
            delayPrm1: patchData.delayPrm1,
            delayTime: patchData.delayTime,
            reverbType: patchData.reverbType ?? 'OFF',
            reverbPrm1: patchData.reverbPrm1,
            reverbDecay: patchData.reverbDecay,
          });
        } catch (error) {
          console.error('Failed to load patch for edit:', error);
          showToast('Erro ao carregar os dados do patch.', 'danger');
          navigation.goBack();
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExistingPatch();
  }, [mode, id, reset, navigation, showToast]);

  // Set custom navigation title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: mode === 'edit' ? 'Editar Patch' : 'Criar Patch',
    });
  }, [mode, navigation]);

  // Form watchers for dynamic parameter opacity/editing
  const compType = watch('compType');
  const driveType = watch('driveType');
  const znrType = watch('znrType');
  const modType = watch('modType');
  const delayType = watch('delayType');
  const reverbType = watch('reverbType');

  const isCompOff = compType === 'OFF' || !compType;
  const isDriveOff = driveType === 'OFF' || !driveType;
  const isZnrOff = znrType === 'OFF' || !znrType;
  const isModOff = modType === 'OFF' || !modType;
  const isDelayOff = delayType === 'OFF' || !delayType;
  const isReverbOff = reverbType === 'OFF' || !reverbType;

  // Toggles active accordion section
  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const onSubmit = async (values: PatchFormValues) => {
    // Sanitizes fields by converting dependent parameter inputs to null if module is disabled
    const sanitizedData = {
      songName: values.songName,
      artist: values.artist,
      patchLevel: values.patchLevel,
      compType: values.compType,
      compPrm: values.compType === 'OFF' ? null : values.compPrm,
      driveType: values.driveType,
      driveGain: values.driveType === 'OFF' ? null : values.driveGain,
      eqLow: values.eqLow,
      eqMid: values.eqMid,
      eqHigh: values.eqHigh,
      znrType: values.znrType,
      znrPrm: values.znrType === 'OFF' ? null : values.znrPrm,
      modType: values.modType,
      modPrm1: values.modType === 'OFF' ? null : values.modPrm1,
      modRate: values.modType === 'OFF' ? null : values.modRate,
      delayType: values.delayType,
      delayPrm1: values.delayType === 'OFF' ? null : values.delayPrm1,
      delayTime: values.delayType === 'OFF' ? null : values.delayTime,
      reverbType: values.reverbType,
      reverbPrm1: values.reverbType === 'OFF' ? null : values.reverbPrm1,
      reverbDecay: values.reverbType === 'OFF' ? null : values.reverbDecay,
    };

    try {
      if (mode === 'edit' && id) {
        await patchesService.update(id, sanitizedData);
        showToast('Patch atualizado com sucesso!', 'success');
        navigation.navigate('PatchDetail', { id });
      } else {
        const newId = await patchesService.create(sanitizedData);
        showToast('Patch salvo com sucesso!', 'success');
        navigation.navigate('PatchDetail', { id: newId });
      }
    } catch (error) {
      console.error('Failed to save patch data:', error);
      showToast('Erro ao salvar o patch.', 'danger');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // Renders a styled accordion header item
  const renderAccordionHeader = (section: string, title: string, icon: string) => {
    const isExpanded = expandedSection === section;
    return (
      <TouchableOpacity
        style={[styles.accordionHeader, isExpanded && styles.accordionHeaderOpen]}
        onPress={() => toggleSection(section)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name={icon as any}
            size={20}
            color={isExpanded ? COLORS.primary : COLORS.textSecondary}
            style={styles.headerIcon}
          />
          <Text
            style={[styles.headerTitle, isExpanded && styles.headerTitleActive]}
          >
            {title}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION: METADATA */}
          <View style={styles.sectionContainer}>
            {renderAccordionHeader('METADATA', 'INFORMAÇÕES BÁSICAS', 'music')}
            {expandedSection === 'METADATA' && (
              <View style={styles.accordionContent}>
                <Text style={styles.inputLabel}>Nome da Música *</Text>
                <Controller
                  control={control}
                  name="songName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.songName && styles.inputErrorBorder,
                      ]}
                      placeholder="Ex: Comfortably Numb"
                      placeholderTextColor={COLORS.textSecondary}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.songName && (
                  <Text style={styles.errorText}>{errors.songName.message}</Text>
                )}

                <Text style={styles.inputLabel}>Artista / Banda *</Text>
                <Controller
                  control={control}
                  name="artist"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.artist && styles.inputErrorBorder,
                      ]}
                      placeholder="Ex: Pink Floyd"
                      placeholderTextColor={COLORS.textSecondary}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.artist && (
                  <Text style={styles.errorText}>{errors.artist.message}</Text>
                )}

                <Text style={styles.inputLabel}>Volume do Patch (0 - 100)</Text>
                <Controller
                  control={control}
                  name="patchLevel"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.patchLevel && styles.inputErrorBorder,
                      ]}
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(text === '' ? 0 : Number(text))}
                      value={value !== undefined && value !== null ? value.toString() : ''}
                    />
                  )}
                />
                {errors.patchLevel && (
                  <Text style={styles.errorText}>{errors.patchLevel.message}</Text>
                )}
              </View>
            )}
          </View>

          {/* SECTION: COMP/EFX */}
          <View style={styles.sectionContainer}>
            {renderAccordionHeader('COMP', 'COMP/EFX', 'altimeter')}
            {expandedSection === 'COMP' && (
              <View style={styles.accordionContent}>
                <Text style={styles.inputLabel}>Tipo de Efeito</Text>
                <View style={styles.pickerContainer}>
                  <Controller
                    control={control}
                    name="compType"
                    render={({ field: { onChange, value } }) => (
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        dropdownIconColor={COLORS.textSecondary}
                        style={styles.picker}
                      >
                        {COMP_EFX_TYPES.map((t) => (
                          <Picker.Item
                            key={t}
                            label={t}
                            value={t}
                            color={COLORS.textPrimary}
                            style={styles.pickerItem}
                          />
                        ))}
                      </Picker>
                    )}
                  />
                </View>

                <View style={[styles.depField, isCompOff && styles.disabledField]}>
                  <Text style={styles.inputLabel}>Parâmetro (0 - 9)</Text>
                  <Controller
                    control={control}
                    name="compPrm"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        editable={!isCompOff}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text === '' ? null : Number(text))}
                        value={value !== null && value !== undefined ? value.toString() : ''}
                      />
                    )}
                  />
                </View>
              </View>
            )}
          </View>

          {/* SECTION: DRIVE */}
          <View style={styles.sectionContainer}>
            {renderAccordionHeader('DRIVE', 'DRIVE', 'guitar-pick')}
            {expandedSection === 'DRIVE' && (
              <View style={styles.accordionContent}>
                <Text style={styles.inputLabel}>Tipo de Drive</Text>
                <View style={styles.pickerContainer}>
                  <Controller
                    control={control}
                    name="driveType"
                    render={({ field: { onChange, value } }) => (
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        dropdownIconColor={COLORS.textSecondary}
                        style={styles.picker}
                      >
                        {DRIVE_TYPES.map((t) => (
                          <Picker.Item
                            key={t}
                            label={t}
                            value={t}
                            color={COLORS.textPrimary}
                            style={styles.pickerItem}
                          />
                        ))}
                      </Picker>
                    )}
                  />
                </View>

                <View style={[styles.depField, isDriveOff && styles.disabledField]}>
                  <Text style={styles.inputLabel}>Gain (0 - 30)</Text>
                  <Controller
                    control={control}
                    name="driveGain"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        editable={!isDriveOff}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text === '' ? null : Number(text))}
                        value={value !== null && value !== undefined ? value.toString() : ''}
                      />
                    )}
                  />
                </View>
              </View>
            )}
          </View>

          {/* SECTION: EQUALIZER */}
          <View style={styles.sectionContainer}>
            {renderAccordionHeader('EQ', 'EQUALIZADOR (3-BAND)', 'equalizer')}
            {expandedSection === 'EQ' && (
              <View style={styles.accordionContent}>
                {/* LOW */}
                <View style={styles.sliderSection}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.inputLabel}>LOW (Graves)</Text>
                    <Controller
                      control={control}
                      name="eqLow"
                      render={({ field: { value } }) => (
                        <Text style={styles.sliderValueText}>
                          {value > 0 ? `+${value}` : value}
                        </Text>
                      )}
                    />
                  </View>
                  <Controller
                    control={control}
                    name="eqLow"
                    render={({ field: { onChange, value } }) => (
                      <Slider
                        minimumValue={EQUALIZER_MIN}
                        maximumValue={EQUALIZER_MAX}
                        step={1}
                        value={value}
                        onValueChange={onChange}
                        minimumTrackTintColor={COLORS.primary}
                        maximumTrackTintColor={COLORS.border}
                        thumbTintColor={COLORS.primary}
                        style={styles.slider}
                      />
                    )}
                  />
                </View>

                {/* MID */}
                <View style={styles.sliderSection}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.inputLabel}>MID (Médios)</Text>
                    <Controller
                      control={control}
                      name="eqMid"
                      render={({ field: { value } }) => (
                        <Text style={styles.sliderValueText}>
                          {value > 0 ? `+${value}` : value}
                        </Text>
                      )}
                    />
                  </View>
                  <Controller
                    control={control}
                    name="eqMid"
                    render={({ field: { onChange, value } }) => (
                      <Slider
                        minimumValue={-6}
                        maximumValue={6}
                        step={1}
                        value={value}
                        onValueChange={onChange}
                        minimumTrackTintColor={COLORS.primary}
                        maximumTrackTintColor={COLORS.border}
                        thumbTintColor={COLORS.primary}
                        style={styles.slider}
                      />
                    )}
                  />
                </View>

                {/* HIGH */}
                <View style={styles.sliderSection}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.inputLabel}> HIGH (Agudos)</Text>
                    <Controller
                      control={control}
                      name="eqHigh"
                      render={({ field: { value } }) => (
                        <Text style={styles.sliderValueText}>
                          {value > 0 ? `+${value}` : value}
                        </Text>
                      )}
                    />
                  </View>
                  <Controller
                    control={control}
                    name="eqHigh"
                    render={({ field: { onChange, value } }) => (
                      <Slider
                        minimumValue={-6}
                        maximumValue={6}
                        step={1}
                        value={value}
                        onValueChange={onChange}
                        minimumTrackTintColor={COLORS.primary}
                        maximumTrackTintColor={COLORS.border}
                        thumbTintColor={COLORS.primary}
                        style={styles.slider}
                      />
                    )}
                  />
                </View>
              </View>
            )}
          </View>

          {/* SECTION: ZNR / AMP */}
          <View style={styles.sectionContainer}>
            {renderAccordionHeader('ZNR', 'ZNR/AMP', 'sine-wave')}
            {expandedSection === 'ZNR' && (
              <View style={styles.accordionContent}>
                <Text style={styles.inputLabel}>Tipo de ZNR</Text>
                <View style={styles.pickerContainer}>
                  <Controller
                    control={control}
                    name="znrType"
                    render={({ field: { onChange, value } }) => (
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        dropdownIconColor={COLORS.textSecondary}
                        style={styles.picker}
                      >
                        {ZNR_AMP_TYPES.map((t) => (
                          <Picker.Item
                            key={t}
                            label={t}
                            value={t}
                            color={COLORS.textPrimary}
                            style={styles.pickerItem}
                          />
                        ))}
                      </Picker>
                    )}
                  />
                </View>

                <View style={[styles.depField, isZnrOff && styles.disabledField]}>
                  <Text style={styles.inputLabel}>Parâmetro (0 - 9)</Text>
                  <Controller
                    control={control}
                    name="znrPrm"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        editable={!isZnrOff}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text === '' ? null : Number(text))}
                        value={value !== null && value !== undefined ? value.toString() : ''}
                      />
                    )}
                  />
                </View>
              </View>
            )}
          </View>

          {/* SECTION: MODULATION */}
          <View style={styles.sectionContainer}>
            {renderAccordionHeader('MOD', 'MODULATION', 'waveform')}
            {expandedSection === 'MOD' && (
              <View style={styles.accordionContent}>
                <Text style={styles.inputLabel}>Tipo de Modulação</Text>
                <View style={styles.pickerContainer}>
                  <Controller
                    control={control}
                    name="modType"
                    render={({ field: { onChange, value } }) => (
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        dropdownIconColor={COLORS.textSecondary}
                        style={styles.picker}
                      >
                        {MODULATION_TYPES.map((t) => (
                          <Picker.Item
                            key={t}
                            label={t}
                            value={t}
                            color={COLORS.textPrimary}
                            style={styles.pickerItem}
                          />
                        ))}
                      </Picker>
                    )}
                  />
                </View>

                <View style={[styles.depField, isModOff && styles.disabledField]}>
                  <Text style={styles.inputLabel}>Parâmetro (0 - 9)</Text>
                  <Controller
                    control={control}
                    name="modPrm1"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        editable={!isModOff}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text === '' ? null : Number(text))}
                        value={value !== null && value !== undefined ? value.toString() : ''}
                      />
                    )}
                  />

                  <Text style={styles.inputLabel}>Rate (10 - 2000 ms)</Text>
                  <Controller
                    control={control}
                    name="modRate"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        editable={!isModOff}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text === '' ? null : Number(text))}
                        value={value !== null && value !== undefined ? value.toString() : ''}
                      />
                    )}
                  />
                </View>
              </View>
            )}
          </View>

          {/* SECTION: DELAY */}
          <View style={styles.sectionContainer}>
            {renderAccordionHeader('DELAY', 'DELAY', 'history')}
            {expandedSection === 'DELAY' && (
              <View style={styles.accordionContent}>
                <Text style={styles.inputLabel}>Tipo de Delay</Text>
                <View style={styles.pickerContainer}>
                  <Controller
                    control={control}
                    name="delayType"
                    render={({ field: { onChange, value } }) => (
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        dropdownIconColor={COLORS.textSecondary}
                        style={styles.picker}
                      >
                        {DELAY_TYPES.map((t) => (
                          <Picker.Item
                            key={t}
                            label={t}
                            value={t}
                            color={COLORS.textPrimary}
                            style={styles.pickerItem}
                          />
                        ))}
                      </Picker>
                    )}
                  />
                </View>

                <View style={[styles.depField, isDelayOff && styles.disabledField]}>
                  <Text style={styles.inputLabel}>Feedback (0 - 9)</Text>
                  <Controller
                    control={control}
                    name="delayPrm1"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        editable={!isDelayOff}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text === '' ? null : Number(text))}
                        value={value !== null && value !== undefined ? value.toString() : ''}
                      />
                    )}
                  />

                  <Text style={styles.inputLabel}>Time (0 - 5000 ms)</Text>
                  <Controller
                    control={control}
                    name="delayTime"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        editable={!isDelayOff}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text === '' ? null : Number(text))}
                        value={value !== null && value !== undefined ? value.toString() : ''}
                      />
                    )}
                  />
                </View>
              </View>
            )}
          </View>

          {/* SECTION: REVERB */}
          <View style={styles.sectionContainer}>
            {renderAccordionHeader('REVERB', 'REVERB', 'waves')}
            {expandedSection === 'REVERB' && (
              <View style={styles.accordionContent}>
                <Text style={styles.inputLabel}>Tipo de Reverb</Text>
                <View style={styles.pickerContainer}>
                  <Controller
                    control={control}
                    name="reverbType"
                    render={({ field: { onChange, value } }) => (
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        dropdownIconColor={COLORS.textSecondary}
                        style={styles.picker}
                      >
                        {REVERB_TYPES.map((t) => (
                          <Picker.Item
                            key={t}
                            label={t}
                            value={t}
                            color={COLORS.textPrimary}
                            style={styles.pickerItem}
                          />
                        ))}
                      </Picker>
                    )}
                  />
                </View>

                <View style={[styles.depField, isReverbOff && styles.disabledField]}>
                  <Text style={styles.inputLabel}>Parâmetro (0 - 9)</Text>
                  <Controller
                    control={control}
                    name="reverbPrm1"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        editable={!isReverbOff}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text === '' ? null : Number(text))}
                        value={value !== null && value !== undefined ? value.toString() : ''}
                      />
                    )}
                  />

                  <Text style={styles.inputLabel}>Decay (1 - 30)</Text>
                  <Controller
                    control={control}
                    name="reverbDecay"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        editable={!isReverbOff}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text === '' ? null : Number(text))}
                        value={value !== null && value !== undefined ? value.toString() : ''}
                      />
                    )}
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#0E0E0F" />
            ) : (
              <Text style={styles.saveText}>Salvar Patch</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90, // Room for fixed footer
  },
  sectionContainer: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
  },
  accordionHeaderOpen: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.technicalLabel,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerTitleActive: {
    color: COLORS.textPrimary,
  },
  accordionContent: {
    padding: 16,
    backgroundColor: '#121215',
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 6,
    height: 44,
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputErrorBorder: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 120 : Platform.OS === 'android' ? 52 : 44,
    justifyContent: 'center',
  },
  picker: {
    color: COLORS.textPrimary,
    width: '100%',
    backgroundColor: 'transparent',
    height: Platform.OS === 'ios' ? 120 : Platform.OS === 'android' ? 52 : 44,
  },
  pickerItem: {
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
  },
  depField: {
    marginTop: 4,
  },
  disabledField: {
    opacity: 0.3,
  },
  sliderSection: {
    marginBottom: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderValueText: {
    color: COLORS.primary,
    fontFamily: FONTS.technicalLabel,
    fontSize: 13,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cancelText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
  saveButton: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#0E0E0F',
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
});
