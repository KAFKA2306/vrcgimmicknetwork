import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { GimmickService } from 'backend/gimmick-service';

$w.onReady(function () {
    // Set page title
    $w("#pageTitle").text = "ギミック情報投稿";

    // Get form elements
    const titleInput = $w("#titleInput");
    const contentInput = $w("#contentInput");
    const mainImage = $w("#mainImage");
    const unityVersionInput = $w("#unityVersionInput");
    const sdkVersionInput = $w("#sdkVersionInput");
    const targetInput = $w("#targetInput");
    const difficultyDropdown = $w("#difficultyDropdown");
    const prerequisitesInput = $w("#prerequisitesInput");
    const environmentInput = $w("#environmentInput");
    const gimmickCategoryInput = $w("#gimmickCategoryInput");
    const gimmickTagInput = $w("#gimmickTagInput");
    const submitterNameInput = $w("#submitterNameInput");
    const submitterEmailInput = $w("#submitterEmailInput");
    const submitButton = $w("#submitButton");
    const successMessage = $w("#successMessage");
    const errorMessage = $w("#errorMessage");

    // Submit button click event
    submitButton.onClick(async () => {
        // Get form values
        const title = titleInput.value;
        const content = contentInput.value;
        const mainImageSrc = mainImage.src; // Assuming image is uploaded and src is available
        const unityVersion = unityVersionInput.value;
        const sdkVersion = sdkVersionInput.value;
        const target = targetInput.value; // Assuming this is a text input for now
        const difficulty = difficultyDropdown.value;
        const prerequisites = prerequisitesInput.value;
        const environment = environmentInput.value;
        const gimmickCategory = gimmickCategoryInput.value; // Assuming this is a text input for now
        const gimmickTag = gimmickTagInput.value; // Assuming this is a text input for now
        const submitterName = submitterNameInput.value;
        const submitterEmail = submitterEmailInput.value;

        // Basic validation (add more as needed)
        if (!title || !content) {
            errorMessage.text = "タイトルと本文は必須項目です。";
            errorMessage.show();
            return;
        }

        // Prepare data for submission
        const gimmickData = {
            title: title,
            content: content,
            mainImage: mainImageSrc,
            unityVersion: unityVersion,
            sdkVersion: sdkVersion,
            target: target,
            difficulty: difficulty,
            prerequisites: prerequisites,
            environment: environment,
            gimmickCategory: gimmickCategory,
            gimmickTag: gimmickTag,
            submitterName: submitterName,
            submitterEmail: submitterEmail,
            _createdDate: new Date(), // Set creation date
        };

        try {
            // Call the backend function to save the data
            const result = await GimmickService.createGimmick(gimmickData);

            if (result) {
                // Show success message
                successMessage.text = "投稿が完了しました！";
                successMessage.show();

                // Clear the form
                clearForm();

                // Redirect to the home page or gimmick detail page
                wixLocation.to("/"); // Or to the detail page if you have the ID
            } else {
                // Show error message
                errorMessage.text = "投稿に失敗しました。";
                errorMessage.show();
            }
        } catch (error) {
            console.error("Error submitting gimmick:", error);
            errorMessage.text = "投稿中にエラーが発生しました。";
            errorMessage.show();
        }
    });

    // Function to clear the form
    function clearForm() {
        titleInput.value = "";
        contentInput.value = "";
        mainImage.src = "";
        unityVersionInput.value = "";
        sdkVersionInput.value = "";
        targetInput.value = "";
        difficultyDropdown.value = "";
        prerequisitesInput.value = "";
        environmentInput.value = "";
        gimmickCategoryInput.value = "";
        gimmickTagInput.value = "";
        submitterNameInput.value = "";
        submitterEmailInput.value = "";
    }
});