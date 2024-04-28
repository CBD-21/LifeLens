import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'notesDB.db',
    location: 'default',
  },
  () => { },
  error => {
    console.log('Error opening database:', error);
  }
);

class NotesDatabase {
  static initDatabase() {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS notesDB (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, priority TEXT, status TEXT, created_at DATETIME)'
      );
    });
  }

  static saveNote(title: string, description: string, priority: string, status: string) {
    const currentDate = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql('INSERT INTO notesDB (title, description, priority, status, created_at) VALUES (?, ?, ?, ?, ?)', [title, description, priority, status, currentDate]);
    });
  }

  static getAllNotes(callback: (notes: { id: number; title: string; description: string; priority: string; status: string; created_at: string }[]) => void) {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM notesDB', [], (_, { rows }) => {
        const notes = [];
        for (let i = 0; i < rows.length; i++) {
          notes.push(rows.item(i));
        }
        callback(notes);
      });
    });
  }

  static deleteNote(id: number, callback: () => void) {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM notesDB WHERE id = ?', [id], callback);
    });
  }

  static updateNoteStatus(id: number, status: string, callback: () => void) {
    db.transaction(tx => {
      tx.executeSql('UPDATE notesDB SET status = ? WHERE id = ?', [status, id], callback);
    });
  }
}

NotesDatabase.initDatabase();

const App = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Alto');
  const [notes, setNotes] = useState<{ id: number; title: string; description: string; priority: string; status: string; created_at: string }[]>([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = () => {
    NotesDatabase.getAllNotes(notes => {
      const sortedNotes = notes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotes(sortedNotes);
    });
  };

  const saveNote = () => {
    if (title && description) {
      NotesDatabase.saveNote(title, description, priority, 'No completado');
      setTitle('');
      setDescription('');
      setPriority('Alto'); // Reset priority to default after saving
      fetchNotes();
    } else {
      console.log('Por favor, introduce un título y una descripción para guardar la nota.');
    }
  };

  const deleteNote = (id: number) => {
    NotesDatabase.deleteNote(id, () => {
      fetchNotes();
    });
  };

  const toggleNoteStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'No completado' ? 'Completado' : 'No completado';
    NotesDatabase.updateNoteStatus(id, newStatus, () => {
      fetchNotes(); // Update the list after changing the status
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  return (
    <View style={styles.container}>
        <Text style={styles.header}>Guardar Nota</Text>
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={title}
          onChangeText={text => setTitle(text)} />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={text => setDescription(text)} />
          <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={priority}
          style={styles.dropdown}
          onValueChange={(itemValue) => setPriority(itemValue)}>
          <Picker.Item label="Alto" value="Alto" />
          <Picker.Item label="Medio" value="Medio" />
          <Picker.Item label="Bajo" value="Bajo" />
        </Picker>
        </View>
        <Button title="Guardar Nota" onPress={saveNote} />
        <Text style={[styles.header, { marginTop: 20 }]}>Notas Guardadas</Text>
        <FlatList
          data={notes}
          renderItem={({ item }) => (
            <View style={styles.noteItem}>
              <View style={styles.buttons}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteDate}>{formatDate(item.created_at)}</Text>
              </View>
              <Text style={styles.noteDescription}>{item.description}</Text>
              <Text style={styles.notePriority}>Prioridad: {item.priority}</Text>
              <Text style={styles.noteStatus}>Estado: {item.status}</Text>
              <View style={styles.buttons}>
                <Button
                  title={item.status === 'No completado' ? 'Marcar como Completado' : 'Marcar como No completado'}
                  onPress={() => toggleNoteStatus(item.id, item.status)}
                  color={item.status === 'No completado' ? 'green' : 'red'} />
                <Button title="Eliminar" onPress={() => deleteNote(item.id)} color="red" />
              </View>
            </View>
          )}
          keyExtractor={item => item.id.toString()} />
      </View>
  );
};

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dropdownContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
  },
  noteItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteDescription: {
    fontSize: 14,
  },
  notePriority: {
    fontSize: 14,
  },
  noteStatus: {
    fontSize: 14,
    marginBottom: 5,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default App;
