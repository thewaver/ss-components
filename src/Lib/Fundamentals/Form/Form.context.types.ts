export type FormEntry = {
    getHasError: () => boolean;
};

export type FormContextType = {
    register: (entry: FormEntry) => void;
    unregister: (entry: FormEntry) => void;
    getIsValid: () => boolean;
    getHasSubmitted: () => boolean;
};
