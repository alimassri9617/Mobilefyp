import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAppointments } from '../../hooks/useAppointments';

const AppointmentsScreen = () => {
  const {
    appointments,
    loading,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: new Date(),
    location: '',
    type: 'meeting',
    priority: 'medium',
  });

  const appointmentTypes = [
    'meeting',
    'consultation',
    'interview',
    'presentation',
    'workshop',
    'other',
  ];

  const priorities = [
    { value: 'low', color: '#4caf50', label: 'Low' },
    { value: 'medium', color: '#ff9800', label: 'Medium' },
    { value: 'high', color: '#f44336', label: 'High' },
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const handleCreateAppointment = async () => {
    if (!newAppointment.title.trim()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Title is required' });
      return;
    }

    const appointmentData = {
      ...newAppointment,
      datetime: new Date(
        newAppointment.date.getFullYear(),
        newAppointment.date.getMonth(),
        newAppointment.date.getDate(),
        newAppointment.time.getHours(),
        newAppointment.time.getMinutes()
      ),
    };

    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment._id, appointmentData);
      } else {
        await createAppointment(appointmentData);
      }

      setModalVisible(false);
      setEditingAppointment(null);
      resetForm();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save appointment' });
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    const appointmentDate = new Date(appointment.datetime);
    setNewAppointment({
      title: appointment.title,
      description: appointment.description || '',
      date: appointmentDate,
      time: appointmentDate,
      location: appointment.location || '',
      type: appointment.type || 'meeting',
      priority: appointment.priority || 'medium',
    });
    setModalVisible(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await deleteAppointment(appointmentId);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete appointment' });
    }
  };

  const resetForm = () => {
    setNewAppointment({
      title: '',
      description: '',
      date: new Date(),
      time: new Date(),
      location: '',
      type: 'meeting',
      priority: 'medium',
    });
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const isUpcoming = (datetime) => new Date(datetime) > new Date();

  const sortedAppointments = appointments.sort((a, b) =>
    new Date(a.datetime) - new Date(b.datetime)
  );

  const renderAppointment = ({ item }) => {
    const { date, time } = formatDateTime(item.datetime);
    const upcoming = isUpcoming(item.datetime);
    const priority = priorities.find(p => p.value === item.priority) || priorities[1];

    return (
      <Card style={[styles.appointmentCard, !upcoming && styles.pastAppointment]}>
        <Card.Content>
          <View style={styles.appointmentHeader}>
            <View style={styles.appointmentTitleContainer}>
              <Title style={[styles.appointmentTitle, !upcoming && styles.pastText]}>
                {item.title}
              </Title>
              <View style={styles.chipContainer}>
                <Chip mode="outlined" style={[styles.priorityChip, { backgroundColor: priority.color + '20' }]} textStyle={{ color: priority.color }}>
                  {priority.label}
                </Chip>
                <Chip mode="outlined" style={styles.typeChip}>
                  {item.type}
                </Chip>
              </View>
            </View>
            <View style={styles.appointmentActions}>
              <TouchableOpacity onPress={() => handleEditAppointment(item)} style={styles.actionButton}>
                <Ionicons name="pencil-outline" size={20} color="#1976d2" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteAppointment(item._id)} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={20} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          </View>
          {item.description && (
            <Paragraph style={[styles.description, !upcoming && styles.pastText]}>
              {item.description}
            </Paragraph>
          )}
          <View style={styles.appointmentDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={upcoming ? "#666" : "#999"} />
              <Text style={[styles.detailText, !upcoming && styles.pastText]}>{date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={upcoming ? "#666" : "#999"} />
              <Text style={[styles.detailText, !upcoming && styles.pastText]}>{time}</Text>
            </View>
            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={upcoming ? "#666" : "#999"} />
                <Text style={[styles.detailText, !upcoming && styles.pastText]}>{item.location}</Text>
              </View>
            )}
          </View>
          {!upcoming && (
            <View style={styles.pastIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
              <Text style={styles.pastLabel}>Completed</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedAppointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No appointments scheduled</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to schedule your first appointment
            </Text>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          setEditingAppointment(null);
          resetForm();
          setModalVisible(true);
        }}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setEditingAppointment(null);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>
            {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
          </Title>

          <TextInput
            label="Title *"
            value={newAppointment.title}
            onChangeText={(text) => setNewAppointment({ ...newAppointment, title: text })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Description"
            value={newAppointment.description}
            onChangeText={(text) => setNewAppointment({ ...newAppointment, description: text })}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Location"
            value={newAppointment.location}
            onChangeText={(text) => setNewAppointment({ ...newAppointment, location: text })}
            style={styles.input}
            mode="outlined"
          />

          <View style={styles.dateTimeContainer}>
            <TouchableOpacity style={styles.dateTimeButton}>
              <Ionicons name="calendar-outline" size={20} color="#1976d2" />
              <Text style={styles.dateTimeText}>
                {newAppointment.date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateTimeButton}>
              <Ionicons name="time-outline" size={20} color="#1976d2" />
              <Text style={styles.dateTimeText}>
                {newAppointment.time.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.typeSelector}>
            <Text style={styles.selectorLabel}>Type:</Text>
            <View style={styles.typeGrid}>
              {appointmentTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    newAppointment.type === type && styles.activeTypeButton,
                  ]}
                  onPress={() => setNewAppointment({ ...newAppointment, type })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    newAppointment.type === type && styles.activeTypeButtonText,
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.prioritySelector}>
            <Text style={styles.selectorLabel}>Priority:</Text>
            <View style={styles.priorityGrid}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: newAppointment.priority === priority.value
                        ? priority.color
                        : '#f0f0f0',
                    },
                  ]}
                  onPress={() => setNewAppointment({ ...newAppointment, priority: priority.value })}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    {
                      color: newAppointment.priority === priority.value ? '#fff' : '#666',
                    },
                  ]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => {
                setModalVisible(false);
                setEditingAppointment(null);
              }}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateAppointment}
              style={styles.modalButton}
            >
              {editingAppointment ? 'Update' : 'Create'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  appointmentCard: {
    marginBottom: 12,
    elevation: 2,
  },
  pastAppointment: {
    opacity: 0.7,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  appointmentTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  appointmentTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityChip: {
    height: 28,
  },
  typeChip: {
    height: 28,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  description: {
    marginBottom: 12,
    color: '#666',
  },
  appointmentDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#666',
    fontSize: 14,
  },
  pastText: {
    color: '#999',
  },
  pastIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pastLabel: {
    color: '#4caf50',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  dateTimeText: {
    color: '#333',
    fontSize: 14,
  },
  typeSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  activeTypeButton: {
    backgroundColor: '#1976d2',
  },
  typeButtonText: {
    color: '#666',
    fontSize: 12,
  },
  activeTypeButtonText: {
    color: '#fff',
  },
  prioritySelector: {
    marginBottom: 20,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default AppointmentsScreen;

