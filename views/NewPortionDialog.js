import React, { useContext } from 'react';
import Context from '../state/context';
import { Text, Dialog, Input } from '@rneui/themed';
import useApi from '../utils/hooks/useApi';

const url = '/employees/by-berry-id';

const NewPortionDialog = ({
  show,
  dontShow,
  berryId,
}) => {
  const { loading, data, fetchError } = useApi({ url }, { berryId }, !show);

  console.log({loading, data});

  const { firstName, lastName } = data || {};
  
  return (
    <Dialog isVisible={show} onBackdropPress={dontShow}>
      {
        loading ? <Dialog.Loading /> : null
      }
      {
        data ? (
          <>
            <Text>{firstName}</Text>
            <Text>{lastName}</Text>
          </>
        ) : null
      }
    </Dialog>
  );
};

export default NewPortionDialog;
