import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

type DeleteModalProps = {
  visible: boolean;
  songName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

// Represents a premium warning modal confirming deletion actions
export const DeleteModal = ({
  visible,
  songName,
  onCancel,
  onConfirm,
}: DeleteModalProps) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={40} color={COLORS.primary} />
          </View>

          <Text style={styles.titleText}>Excluir patch?</Text>

          <Text style={styles.descriptionText}>
            Essa ação não pode ser desfeita. O patch{' '}
            <Text style={styles.boldText}>"{songName}"</Text> será removido
            permanentemente.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  descriptionText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  boldText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyBold,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cancelText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#F0F0F0',
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
});
