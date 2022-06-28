import PaginatedTable from "../components/PaginatedTable";
import { View } from "react-native";
import styles from "../styles/styles";
import { Linking } from "react-native";
import { useState } from "react";
import useUser from "../utils/hooks/useUser";
import { Alert } from "react-native";
import request from "../utils/request";

const url = '/employees';

const columns = {
  id: {
    name: 'ID',
    type: 'number',
    hidden: true,
  },
  contract: {
    name: 'Номер кантракта',
    type: 'text',
    hidden: true,
  },
  foremanId: {
    type: 'number',
    hidden: true,
  },
  firstName: {
    name: 'Имя',
    type: 'text',
  },
  lastName: {
    name: 'Фамилия',
    type: 'text',
  },
  photoPath: {
    name: 'Фото',
    type: 'image',
  },
  phone: {
    name: 'Телефон',
    type: 'text',
    hidden: true,
  },
  foreman: {
    name: 'Бригадир',
    type: 'included',
    parse: foreman => foreman ? `${foreman.firstName} ${foreman.lastName}` : 'Нет данных',
    hidden: true,
  },
};

const actions = {
  call: {
    icon: 'cellphone-basic',
    action: emp => {
      Linking.openURL(`tel:+${emp.phone}`);
    },
  },
};

const foremanColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  firstName: {
    name: 'Имя',
    type: 'text',
  },
  lastName: {
    name: 'Фамилия',
    type: 'text',
  },
};

const addFieldsData = {
  firstName: {
    label: 'Имя сотрудника',
    type: 'text',
  },
  lastName: {
    label: 'Фамилия сотрудника',
    type: 'text',
  },
  contract: {
    label: 'Нумар кантракту',
    type: 'text',
  },
  address: {
    label: 'Адрас',
    type: 'text',
  },
  phone: {
    label: 'Тэлефон',
    type: 'phone',
  },
  foremanId: {
    label: 'Выберите бригадира',
    type: 'fetch-select',
    fetchSelectConfig: {
      url: '/foremen',
      columns: foremanColumns,
      showInOption: ['firstName', 'lastName'],
      showInValue: ['firstName', 'lastName'],
      returnValue: 'id',
    }
  },
  photo: {
    label: 'Выберите или перетащите сюда фотографию',
    type: 'file',
  },
};

const Employees = ({ jumpTo, adding }) => {
  const me = useUser();
  const [foreman, setForeman] = useState(me.role === 'foreman' ? { foremanId: me.id } : null);

  const filters = {
    fieldsData: {
      foremanId: {
        label: 'Фильтровать по бригаде',
        type: 'fetch-select',
        fetchSelectConfig: {
          url: '/foremen',
          columns: {
            id: {
              name: 'id',
              type: 'number',
            },
            firstName: {
              name: 'Имя',
              type: 'text',
            },
            lastName: {
              name: 'Фамилия',
              type: 'text',
            },
          },
          showInOption: ['firstName', 'lastName'],
          icon: 'photoPath',
          returnValue: 'id',
        },
        onChangeCallback: id => {
          setForeman(id ? { foremanId: id } : null);
        },
      },
    },
    className: 'inline-form',
    submitable: false,
  };

  const onAdd = values => {
    const formData = new FormData();
    
    Object.entries(values).forEach(([key, value]) =>
      formData.append(key, value)
    );

    request({
      url: '/employees',
      method: 'POST',
      body: formData,
      withFiles: true,
      callback: (status, response) => {
        if (status === 'ok') {
          const { firstName, lastName } = response.data;

          Alert.alert(
            'Добавление сотруденика',
            `Сотрудник ${firstName} ${lastName} успешно добавлен`,
            [{ text: 'ОК' }],
          );

          jumpTo('employees', { adding: false });
        } else {
          const { message } = response;

          Alert.alert(
            'Добавление сотруденика',
            `Ошибка: ${message}`,
            [{ text: 'ОК' }],
          )
        }
      },
    });
  }

  return (
    <View style={styles.main}>
      <View style={styles.blockBorderless}>
        <PaginatedTable
          url={url}
          columns={columns}
          actions={actions}
          customFilters={foreman}
          resetCustomFilters={() => setForeman(null)}
          onAdd={onAdd}
          adding={adding}
          setAdding={isAdding => jumpTo('employees', { adding: isAdding })}
          addFieldsData={addFieldsData}
          {...(me.role === 'admin' && { filters })}
        />
      </View>
    </View>
  );
};

export default Employees;
